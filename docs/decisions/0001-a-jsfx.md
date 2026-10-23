# 0001 - A JSFX, not a ReaScript or a compiled plug-in

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

The user asked for a JSFX: a plug-in written in EEL2 that REAPER compiles
itself. The alternatives were a ReaScript, which could edit items but can't
play anything or answer MIDI, or a compiled VST3/AU, which would need a build
for each platform and code signing on the Mac.

## Decision

One file, `TransientShuffler.jsfx`, copied into REAPER's `Effects` folder.
Samples are dropped on its window, the result plays from the window or from
MIDI notes, and **Print** puts it in the project
(`export_buffer_to_project`, REAPER 6.05+).

## Consequences

- No build and no installer. It runs on Mac, Windows and Linux REAPER alike.
- **No file dialog.** JSFX can't open one, so dropping a file is the only way
  to load a sample.
- No access to the system's accessibility features (VoiceOver, Dynamic Type,
  Increase Contrast) or its appearance setting. The window has to provide
  its own keyboard control, interface size and contrast (0010).
- About 8 million words of memory, and loops that stop after about a million
  passes. These set the length limit (0005).
- It can't be tried here. The tests run its code outside REAPER (0008), so
  anything that depends on how REAPER itself behaves is unverified until the
  user tries it.
