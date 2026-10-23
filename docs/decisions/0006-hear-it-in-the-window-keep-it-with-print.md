# 0006 - Hear it from the window or MIDI; keep it with Print

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

The result has to be heard while it is shaped, and then kept. A JSFX can
play sound, and REAPER 6.05+ lets one add audio to the project
(`export_buffer_to_project`).

## Decision

- **Hearing it.**
  - Clicking a waveform plays it, and so do the Play buttons.
  - MIDI notes play the chosen result, or sample A or B (Options). Velocity
    sets the level.
  - Eight voices, reused in turn.
  - While a sound plays, its Play button becomes Stop. With nothing focused,
    Space plays or stops the result.
- **Keeping it.** Print hands the chosen result to REAPER as a new item, at
  the project's rate and without the Output level. It is called with track
  `-1` and flags `0`.
- **Input.** *Pass input audio through* (on by default) mixes the track's own
  audio in, so a printed item on the same track still plays through the
  plug-in.

## Consequences

- A voice plays the whole sound; note-offs are ignored. A voice that gets
  reused cuts off without a fade.
- **Unverified:** what track `-1` means to `export_buffer_to_project`. This
  environment couldn't reach REAPER's documentation, so the call follows
  memory of it. The README says the new item should land on the plug-in's
  own track; the user needs to confirm this in REAPER.
