# 0012 - Find where each attack ends, and keep all of it

- **Date:** 2026-10-25
- **Status:** Accepted. Replaces where 0002 put the crossfade.

## Context

The user asked whether the plug-in could scan the samples to tell the
transient from the body itself, rather than leaving the attack length to be
set by hand.

There is no single right answer. A kick's click is short, bright and often
quieter than its boom. A snare's crack is followed by the wires, which are
also bright. A slow swell has no transient at all. Two measures were tried
on made-up sounds whose attack ends at a known place:

- **Level alone.** A fast follower of the level dropping back below a slow
  one, the way transient designers work. It found snares (13 ms) and hats
  (9 ms). But for a kick it gave 47 ms, and for a pluck 69 ms, because the
  louder body's own decay masked the click.
- **Brightness alone.** The sound above 2.5 kHz falling 20 dB below its
  peak. It found the kick's click (6 ms) and the pick (9 ms), but gave
  176 ms for the snare, whose wires stay bright.

Each was right where the other was wrong.

The first version also centred the crossfade on the attack length (0002).
With a found 7 ms attack and a 10 ms crossfade, the fade began 2 ms after the
hit and blended away the click it had just found.

## Decision

- **Find attack** (on by default) measures each sample when it loads
  (`find_attack_end`), a millisecond at a time over the first 300 ms after
  the hit. The attack ends at the earlier of:
  - **level:** a 2 ms follower of the level falls back below a 20 ms one,
    once the hit has pushed it 10% above. The level is held over ±6 ms
    first, so a low note's waveform isn't read as a decay, and the 6 ms is
    taken back off the result;
  - **brightness:** the sound above 2.5 kHz, through a high-pass filter
    started 5 ms before the hit, falls 20 dB below its own peak. This is
    only used if that peak is within 40 dB of the sample's.

  The result is kept between 2 and 250 ms. If neither moment comes, nothing
  is found and the Attack length setting is used.
- **Each result splices where its own attack sample's attack ends.** "A with
  B's attack" uses B's; "B with A's attack" uses A's.
- **Attack length shows what was found** ("7.0 ms, found"). Moving it, or
  dragging the splice line, is a choice made by hand, so it turns Find
  attack off. A mark at the bottom of the A and B rows shows where each
  sample's attack ends.
- **The crossfade starts at the attack length**, so everything before the
  line is the attack, whole, and the blend comes after. This applies whether
  the length was found or set by hand.

## Consequences

- On the test sounds:
  - a pluck: 9 ms;
  - a kick with a click: 6 ms, though its boom is louder;
  - a snare: 12–14 ms;
  - a slow swell: nothing found.

  The tests hold these within a range, not to the millisecond.
- **Real samples will be messier.** For a sound with two hits (a flam), or
  noise before the hit, the hit itself may be wrong: *Hit threshold* still
  decides where it starts.
- **Hand-set splices sound a little different from 1.0.** The same Attack
  length now keeps half a crossfade more of the attack.
- Finding the attack runs once per load, or when Hit threshold changes, over
  at most 300 ms of sound, so it costs nothing while you work.
