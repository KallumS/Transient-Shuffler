# 0007 - Loading and recomputing happen in the window, not the audio thread

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

Reading a file, converting its rate and finding its hit takes up to a few
hundred milliseconds. In `@sample` or `@block`, that would make the audio
drop out. But a project can open with the plug-in's window closed, and its
samples still have to load.

## Decision

- **`housekeeping()`** does any loading and recomputing that is due. That
  means after a project opens, after the sample rate changes, after a file is
  dropped or after a parameter changes.
- **Window open.** `@gfx` runs it, and records the time it last did
  (`gfx_seen`).
- **Window closed.** `@block` runs it instead, if `@gfx` hasn't run for half
  a second.
- **Messages to the audio side.** The window never touches the voices. It
  sends Play and Stop as counters (`ui_trig`, `ui_stop`) that `@block` reads.

## Consequences

- Dragging a control never makes the audio drop out.
- Loading a project with the window closed does the reading in `@block`, once.
  That could drop out for a moment if the transport is running.
- **Unverified:** that `file_open` works from `@block`.
