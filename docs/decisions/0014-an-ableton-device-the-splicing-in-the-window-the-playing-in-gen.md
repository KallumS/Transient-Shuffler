# 0014. An Ableton device: the splicing in the window, the playing in gen~

Taken 2026-11-10. Stands.

## Context

The user is moving from REAPER to Ableton Live and asked for every family REAPER project as Max for Live, each on its own branch. A JSFX cannot be loaded in Live, and Max's JavaScript cannot run on the audio thread, so the DSP has to become gen~ code. Transient Shuffler also reads sound files, which gen~ cannot.

## Decision

`ableton/` holds a Max for Live device whose sound is gen~ code translated from the `.jsfx` by `ableton/kit/jsfx2gen.js`, on the parser and the rules of Middaw's EEL2 runtime: every variable in one Data, EEL2's memory in another, a GenExpr function per EEL2 function and namespace, every effect a statement in JavaScript's order. @init (and @slider) run once, @slider again when a Param moves, @block every 32 samples, @sample between [plugin~] and [plugout~]. The plug-in's own window runs beside it on Middaw's runtime (@init, @slider and @gfx only, drawn by `ableton/kit/gfx.js`) and sends gen~ what its sliders say, with Live's tempo and transport.

The translation is held to the runtime: the tests read the gen~ code back out of the built `.maxpat`, run it as JavaScript (`ableton/kit/test/genexpr.js`) beside the runtime running the `.jsfx`, and compare every sample. Files are read in the window's copy: a sound dropped on the strip is decoded by a buffer~ and handed to the plug-in's own file_open; its splicing runs there, and the sounds and their tables are copied into gen~'s memory, which for this device is a buffer~ (Buffer M) rather than a Data. The window's Play buttons reach gen~'s @block as Params (ui_trig, ui_trig_src, ui_stop). It is an instrument in Live, because an audio effect there hears no MIDI.

## Consequences

- The gen~ code is generated at build time from the `.jsfx` in the repository root: a fix to the plug-in reaches the device by rebuilding, and the build needs `node`.
- Strings and files are not on the audio thread; their functions do nothing in gen~. What the window needs from them it does in its own copy.
- A meter or display the window draws from the sound itself stays still: the window's copy does not hear the audio.
- Nothing here has been opened in Live, and gen~ has not compiled this code. The tests prove the translation's meaning, not that gen~ accepts every line.

## 11 November 2026: Live's colours

The user asked for the Ableton versions to look like Ableton, and pointed to the Ableton-inspired scheme the family had tried: Starting Blocks' window themed after Live 8 on 18 September 2026 (commit 2765b0a3), neutral greys with a warm amber accent, replaced the same day by the yellow house scheme. The devices now draw in that scheme (`ableton/kit/palette.js`), with two changes so the family's rules hold: the chrome is #3E3E3E rather than #4A4A4A, because on the lighter grey a secondary word cannot reach 7:1 and still look secondary; and the buttons are light grey with dark ink, because light words on its #5E5E5E buttons reach only 5:1. The greys are neutral, as Live's are, not blue-shifted as the house scheme's.

The window is the script's own and is not edited for Live. `Palette.tone` translates as it draws: the house scheme's colours one for one (each chosen so the pairs the script was checked for stay 7:1 and 3:1), its yellow and the shades made of it to the amber, any other grey made neutral at the same brightness (so a palette of its own keeps every contrast), and every other colour left as it is. The REAPER version keeps the house scheme. `kit/test/palette_suite.js` holds all of it, and was checked by breaking each rule.
