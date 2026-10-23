# 0004 - Match level means the attack it replaces

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

A borrowed attack can be as loud as anything. It could be levelled to:

- the body's level at the splice, by RMS around it;
- the peak of the attack it replaces.

Take an 808 (A, a soft attack with a long boom) given a punchy kick's click
(B). Matching at the splice compares B's decayed tail with A's boom, which
is still going strong, so the click would be turned up by tens of dB.
Matching peaks keeps the result as loud as the 808 was.

## Decision

With **Match level** on (the default), the attack is scaled so that its peak,
from 5 ms before the hit to the attack length, equals the body sample's own
peak over the same stretch. *Attack trim* (±24 dB) then adjusts it by ear.
With Match level off, only the trim applies.

## Consequences

- Swapping attacks doesn't make the sound jump in level.
- An attack much brighter than the one it replaces may still sound louder at
  the same peak. That is what *Attack trim* is for.
