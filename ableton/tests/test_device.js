/* The Max for Live device, run in Node on a pretend Max and a pretend Live.
 *   python3 ableton/kit/build.py ableton/device.json && node --test ableton/tests/ */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('../kit/test/max.js');
const genexpr = require('../kit/test/genexpr.js');
const J = require('../kit/runtime/jsfx.js');
const suite = require('../kit/test/audio_suite.js');

const ROOT = path.join(__dirname, '..', '..');
const JSFX = path.join(ROOT, 'TransientShuffler.jsfx');
const BUNDLE = path.join(__dirname, '..', 'TransientShuffler.js');
const { code } = suite({ bundle: BUNDLE, maxpat: path.join(__dirname, '..', 'TransientShuffler.maxpat'),
                         jsfx: JSFX, name: 'Transient Shuffler', window: [820, 704] });

// Two sounds: a soft sine with a slow attack, and a click with a fast one.
const SR = 48000;
function sound(fn, n) { const L = new Float64Array(n), R = new Float64Array(n); for (let i = 0; i < n; i++) { L[i] = R[i] = fn(i); } return { chans: [L, R], rate: SR }; }
const SOFT = sound((i) => Math.min(1, i / 4000) * 0.5 * Math.sin(i * 2 * Math.PI * 110 / SR) * Math.exp(-i / 30000), 24000);
const CLICK = sound((i) => (i < 200 ? 0.9 * (1 - i / 200) * Math.sin(i * 0.9) : 0.2 * Math.sin(i * 2 * Math.PI * 220 / SR) * Math.exp(-i / 4000)), 24000);

function loadedDevice() {
  const d = load(BUNDLE, { width: 820, height: 704, buffers: { 'srcA-1': SOFT, 'srcB-1': CLICK } });
  d.send('bang');
  d.send('mqname', 'mq-1'); d.send('memname', 'mem-1');
  d.send('srcname', 'A', 'srcA-1'); d.send('srcname', 'B', 'srcB-1');
  d.send('drop', 'A', 'Soft.wav'); d.send('loaded', 'A');
  d.send('drop', 'B', 'Click.wav'); d.send('loaded', 'B');
  d.run(2000);
  return d;
}

test('sounds dropped on the strip are read, spliced, and copied to gen~', () => {
  const d = loadedDevice();
  const fx = d.ctx.fx, lenAt = fx.getVar('s_len');
  const lens = [0, 1, 2, 3].map((k) => fx.rd(lenAt + k));
  assert.ok(lens.every((n) => n > 1000), 'A, B and both results are built: ' + lens.join(', '));
  assert.ok(d.out.some((a) => a[0] === 4 && a[1] === 'A' && a[2] === 'replace' && a[3] === 'Soft.wav'), 'the buffer~ was asked to read Soft.wav');
  const mem = d.buffers['mem-1'];
  const sl = fx.getVar('s_l');
  for (let k = 0; k < 4; k++) {
    const L = fx.rd(sl + k);
    for (let j = 0; j < lens[k]; j += 1013) assert.strictEqual(mem[L + j], fx.rd(L + j), 'sound ' + k + ' frame ' + j);
  }
});

test('a note plays the result in gen~ as the plug-in plays it in the runtime', () => {
  const d = loadedDevice();
  const mem = Float64Array.from(d.buffers['mem-1']);
  // the runtime, given the same sounds, playing the same note
  const fx = new J.JSFX(fs.readFileSync(JSFX, 'utf8'), { sampleRate: SR });
  const files = { 'Soft.wav': SOFT, 'Click.wav': CLICK };
  fx.openFile = (name) => { const s = files[name]; const n = s.chans[0].length, out = new Float64Array(n * 2);
    for (let i = 0; i < n; i++) { out[i * 2] = s.chans[0][i]; out[i * 2 + 1] = s.chans[1][i]; } return { samples: out, channels: 2, rate: SR }; };
  fx.init(SR);
  fx.setStr(fx.named('#patha'), 'Soft.wav'); fx.setStr(fx.named('#pathb'), 'Click.wav'); fx.setVar('need_load', 1);
  fx.runSection('block');
  const mq = new Float64Array(1024);
  mq[1] = 0x90; mq[2] = 60; mq[3] = 100; mq[0] = 1;
  const g = genexpr.load(code, { sampleRate: SR, mq, buffers: { M: mem } });
  const outs = [new Float32Array(32), new Float32Array(32)], ins = [new Float32Array(32), new Float32Array(32)];
  let worst = 0, peak = 0;
  for (let b = 0; b < SR / 2; b += 32) {
    fx.process(32, ins, outs, b === 0 ? [{ offset: 0, data: [0x90, 60, 100] }] : []);
    for (let i = 0; i < 32; i++) {
      const y = g.step(0, 0);
      worst = Math.max(worst, Math.abs(y[0] - outs[0][i]), Math.abs(y[1] - outs[1][i]));
      peak = Math.max(peak, Math.abs(outs[0][i]));
    }
  }
  assert.ok(peak > 0.05, 'the result sounded: ' + peak);
  assert.ok(worst < 1e-6, 'gen~ played it as the runtime did: worst ' + worst);
});

test('a saved set reads its sounds again', () => {
  const d = loadedDevice();
  d.ctx.save();
  const saved = d.out.filter((a) => a[0] === 1 && a[1] === 'set').pop();
  const e = load(BUNDLE, { width: 820, height: 704 });
  e.send('restore', saved[2]); e.send('bang');
  e.send('srcname', 'A', 'srcA-2'); e.send('srcname', 'B', 'srcB-2');
  e.run(100);
  assert.ok(e.out.some((a) => a[0] === 4 && a[1] === 'A' && a[3] === 'Soft.wav'), 'Soft.wav is read again');
  assert.ok(e.out.some((a) => a[0] === 4 && a[1] === 'B' && a[3] === 'Click.wav'), 'Click.wav is read again');
});
