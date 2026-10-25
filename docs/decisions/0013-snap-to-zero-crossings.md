# 0013 - Snap to zero crossings, both sounds at once

- **Date:** 2026-10-25
- **Status:** Accepted

## Context

The user asked for an option to snap the splice to zero crossings, as
editors do so that a cut doesn't click. Here two sounds meet at the splice,
not one, and a crossfade already smooths the join. A zero crossing of one
sound is rarely a zero crossing of the other.

## Decision

**Snap to zero crossings** (off by default) moves the splice, which is where
the crossfade starts, to the best point within 5 ms of where it was set or
found. The best point is the one where:

- both sounds are nearest zero together, each measured against its own level
  there, so a loud body doesn't outvote a quiet attack;
- the body is taken after the phase shift that Align phase chose;
- a small preference for nearer points settles ties.

Each sound is measured as left plus right. Attack length shows where the
splice ended up, for example "31.3 → 29.9 ms", and the line is drawn there.

## Consequences

- On the test sounds (an 808 into a punchy kick, 0.5 ms crossfade), the
  splice moved 3.5 ms. How far both sounds were from zero dropped from 2.7 to
  0.27 on the test's scale.
- The splice can move up to 5 ms, which at short attack lengths is a large
  share. That is why snapping is off by default.
- Snapping uses mono, so in a wide stereo sample one side may still be off
  zero at the join. The crossfade covers the rest.
- With a long crossfade, snapping makes little difference; it matters most
  with crossfades of a millisecond or two.
