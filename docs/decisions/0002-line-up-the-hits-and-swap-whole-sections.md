# 0002 - Line up the hits and swap whole sections of sound

- **Date:** 2026-10-15
- **Status:** Accepted. Where the crossfade sits is replaced by
  [0012](0012-find-where-the-attack-ends.md): it now starts at the attack
  length instead of being centred on it.

## Context

"Sample 1 with the transient from sample 2, keeping its own sustain" could be
built several ways:

- a transient shaper, moving one sample's envelope onto the other;
- a spectral or harmonic/percussive split of each sample;
- a time-domain splice: one sample's actual sound up to a point, the other's
  after it.

The first two give an approximation of the attack, not the attack itself,
and the spectral one smears the hit.

## Decision

A splice in time:

1. **The hit.** Each sample's hit is the first sample within *Hit threshold*
   (default -30 dB) of its peak. The two hits are lined up there.
2. **The attack.** From 5 ms before the hit, so the rise isn't cut, up to
   *Attack length* (default 30 ms), the result is the attack sample, scaled
   (0004).
3. **The crossfade.** Centred on the attack length and *Crossfade* long
   (default 10 ms, at most twice the attack), it blends into the body (0003).
4. **The body.** After the crossfade, the result is the body sample,
   unchanged and copied whole (`memcpy`).

Both results, A with B's attack and B with A's, are always made, so switching
between them is instant.

## Consequences

- The borrowed attack is exactly the other sample's, so the result sounds
  like the two samples joined, not like an effect.
- Recomputing is cheap: only the attack and the crossfade are calculated,
  so dragging the splice redraws live.
- A sample with a long, quiet lead-in before its hit, or two hits, needs
  *Hit threshold* adjusted. The detection is a single threshold, not an
  onset detector.
- The body's timing is fixed by the hits. Nothing is time-stretched or
  pitched.
