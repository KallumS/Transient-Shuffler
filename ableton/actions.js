/* Transient Shuffler in Live.
 *
 * In REAPER a sound dropped on the window is read with file_open and spliced
 * by the plug-in itself. Here the sound is dropped on the device strip and
 * decoded by a buffer~ (any format Live reads); the window's copy of the
 * plug-in reads it through file_open as before (fx.openFile), finds the
 * attacks and builds the two results. gen~ plays them: its memory is a
 * buffer~ (Buffer M), and the sounds and their tables are copied there
 * whenever they change. The window's Play buttons reach gen~'s @block through
 * ui_trig, ui_trig_src and ui_stop (fromWindow in device.json). */
var TS = { names: {}, cache: {}, pending: {}, mem: null, sig: '', n: 0, ready: false };
var TS_PATH = { A: '#patha', B: '#pathb' };

function srcname(key, name) { TS.names[key] = String(name); }
function memname(name) { try { TS.mem = new Buffer(String(name)); } catch (e) { TS.mem = null; } TS.sig = ''; }
function baseName(p) { return String(p).replace(/^.*[\/\\:]/, ''); }

// A sound dropped on the strip goes to its buffer~, which says when it is in.
function drop(key, path) {
  path = String(path);
  TS.pending[key] = path;
  outlet(4, key, 'replace', path);
  say('Loading ' + baseName(path) + '…');
}
function loaded(key) {
  var path = TS.pending[key];
  if (!path || !TS.names[key]) return;
  delete TS.pending[key];
  var b = new Buffer(TS.names[key]);
  var ch = Math.max(1, b.channelcount()), n = b.framecount(), ms = b.length();
  if (!(n > 0)) { say('That file has no sound in it. Choose another.'); return; }
  var rate = ms > 0 ? n / (ms / 1000) : 48000;
  var samples = new Float64Array(n * ch);
  for (var c = 0; c < ch; c++) {
    for (var at = 0; at < n; at += 4096) {
      var part = b.peek(c + 1, at, Math.min(4096, n - at));
      for (var i = 0; i < part.length; i++) samples[(at + i) * ch + c] = part[i];
    }
  }
  TS.cache[path] = { samples: samples, channels: ch, rate: Math.round(rate) };
  fx.setStr(fx.named(TS_PATH[key]), path);
  fx.setVar('need_load', 1);
  say('Loaded ' + baseName(path) + ' as ' + key + '.');
}

// What gen~ plays from: each sound's frames, and the tables that say where they are.
function signature() {
  var s = [], sl = fx.getVar('s_l'), focus = fx.getVar('focus');
  for (var a = sl; a < focus; a++) s.push(fx.rd(a));
  for (var k = 0; k < 4; k++) {
    var len = fx.rd(fx.getVar('s_len') + k), L = fx.rd(sl + k);
    for (var j = 0; j < len; j += 997) s.push(fx.rd(L + j));
  }
  return s.join(',');
}
function copyToGen() {
  if (!TS.mem) return;
  var sl = fx.getVar('s_l'), sr = fx.getVar('s_r'), lenAt = fx.getVar('s_len'), focus = fx.getVar('focus');
  function copy(from, n) {
    for (var at = 0; at < n; at += 65536) {
      var part = [], m = Math.min(65536, n - at);
      for (var i = 0; i < m; i++) part.push(fx.rd(from + at + i));
      TS.mem.poke(1, from + at, part);
    }
  }
  for (var k = 0; k < 4; k++) {
    var len = Math.trunc(fx.rd(lenAt + k));
    if (len > 0) { copy(Math.trunc(fx.rd(sl + k)), len); copy(Math.trunc(fx.rd(sr + k)), len); }
  }
  copy(Math.trunc(sl), Math.trunc(focus - sl));
}

var ACTIONS = {
  tick: function (fx) {
    if (!TS.ready) {
      TS.ready = true;
      fx.openFile = function (name) { return TS.cache[name] || null; };
    }
    // a sound named in a saved set is read again
    ['A', 'B'].forEach(function (key) {
      var p = fx.str(fx.named(TS_PATH[key]));
      if (p && !TS.cache[p] && !TS.pending[key] && TS.names[key]) drop(key, p);
    });
    if ((TS.n++ % 25) === 0) fx.runSection('block');   // housekeeping, as @block does while the window is closed
    if ((TS.n % 60) === 0) {
      var sig = signature();
      if (sig !== TS.sig) { TS.sig = sig; copyToGen(); }
    }
  }
};
