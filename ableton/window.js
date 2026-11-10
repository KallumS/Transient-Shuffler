// The picture in the README: `node ableton/window.js` redraws ableton/window.png.
// A soft pad and a click, each given the other's attack.
const P = require('./kit/test/picture.js');
const SR = 48000;
P(__dirname, { bundle: 'TransientShuffler.js', w: 820, h: 704,
  buffers: {
    a: P.sound((i) => Math.min(1, i / 4000) * 0.5 * Math.sin(i * 2 * Math.PI * 110 / SR) * Math.exp(-i / 30000), SR),
    b: P.sound((i) => (i < 200 ? 0.9 * (1 - i / 200) * Math.sin(i * 0.9) : 0.2 * Math.sin(i * 2 * Math.PI * 220 / SR) * Math.exp(-i / 4000)), SR) },
  go(d) {
    d.send('srcname', 'A', 'a'); d.send('srcname', 'B', 'b');
    d.send('drop', 'A', 'Soft pad.wav'); d.send('loaded', 'A');
    d.send('drop', 'B', 'Click.wav'); d.send('loaded', 'B');
    d.run(1500);
  } });
