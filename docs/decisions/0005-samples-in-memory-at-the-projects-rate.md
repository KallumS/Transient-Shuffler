# 0005 - Samples are held in memory at the project's rate; only their paths are saved

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

A JSFX has about 8 million words of memory. It needs to hold four stereo
sounds (A, B and the two results), plus room for loading and printing.
Samples arrive at any rate and with any number of channels. Saving the audio
in the project would make every project file megabytes bigger.

## Decision

- **Length.** Each sound is planar stereo, up to `MAXLEN` = 800 000 frames
  (16.6 s at 48 kHz). Longer files are cut at that length.
- **Channels.** Mono goes to both sides. With more than two channels, the
  first, third and fifth are averaged into the left and the rest into the
  right.
- **Rate.** Files at another rate are converted on loading, with 4-point
  Hermite interpolation. When the rate goes down, a zero-phase 4th-order
  low-pass at 0.45 × the new rate runs first, so high content is removed
  rather than folded back down.
- **Saving.** Only the two file paths are saved with the project. They load
  again when the project opens, and again whenever the project's sample rate
  changes.

## Consequences

- A test checks that the whole memory map fits.
- Moving or renaming a sample file breaks the project's link to it. The row
  then says it couldn't read the file and asks for another.
- Converting the rate happens once, on loading, so playback is a plain read.
- 16.6 s is plenty for drum hits, but not for long samples. A higher rate
  shortens it: 8.3 s at 96 kHz.
