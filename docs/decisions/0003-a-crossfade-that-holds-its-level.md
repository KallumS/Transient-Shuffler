# 0003 - A crossfade that holds its level, and lines the two up first

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

A crossfade with equal-gain curves keeps the level steady when the two sounds
match, but dips 3 dB when they don't. Equal-power curves do the opposite:
steady for unrelated sounds, a bump for matching ones. Drum hits fall
anywhere between the two. Two sounds that are out of phase at the splice can
also cancel and leave a hole.

## Decision

- **Align phase** (on by default): across the start of the crossfade (up to
  10 ms), find the lag within ±2.5 ms at which the attack and the body are
  most alike, measured by normalised correlation of their mono sums. Shift
  the body by that lag, and flip the attack's polarity if the best match is
  negative.
- **The curves**: sine and cosine, divided by
  `sqrt(wa² + wb² + 2·r·wa·wb)`, where `r` is that correlation (0 to 1).
  That keeps the power constant for any degree of likeness: equal-gain when
  `r` = 1, equal-power when `r` = 0.

## Consequences

- Tested three ways:
  - a sound given its own attack comes back unchanged;
  - an upside-down copy is flipped back exactly;
  - two unrelated noises keep their level through the fade.
- The body can move by up to 2.5 ms. That is inaudible as timing, but it is
  why `s_lag` is kept and the result's length depends on it.
- A short crossfade between a loud attack and a quiet body still drops
  steeply. That is what the user asked for, not a fault. The test for this
  case checks that the result is exact, not that it is smooth.
