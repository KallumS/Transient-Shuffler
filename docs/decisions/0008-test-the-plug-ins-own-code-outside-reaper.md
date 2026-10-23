# 0008 - Test the plug-in's own code outside REAPER, and look at pictures of it

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

REAPER can't run in this environment, and reaper.fm is blocked. A JSFX
written blind could fail to compile, or compile and do the wrong thing, and
nothing here would show it.

## Decision

- **The interpreter.** Build WDL's `loose_eel`, the same EEL2 compiler REAPER
  uses. Build it with the same loop limit as REAPER
  (`MAXLOOP=1048576`) and the same memory size.
- **`tests/run_tests.py`** runs the plug-in's code in it:
  - it splits the file into its sections and makes each one a function;
  - REAPER's calls are swapped for stand-ins, so dropped files and loaded
    data can be made up;
  - it drives everything from `tests/tests.eel`, once at the real `MAXLEN`
    and once at a small one that leaves room for made-up files.
- **What the checks cover.**
  - The audio: hits, the exact attack, crossfade and body, the level held,
    phase and polarity, sample-rate conversion, filtering out high content,
    folding down to stereo, playback, printing, saving.
  - The window: dragging, double-click, scrolling, Tab, the arrow keys,
    Return and Space, Play becoming Stop, Undo, messages that stay, interface
    size, font choice, error states.
  - Memory: that everything fits.
- **`tests/render_preview.py`** prints every drawing call instead of making
  it, and PIL draws the result. This follows Miderator's "verify by
  rendering" (its decision 0010).

## Consequences

- The previews caught two bugs the checks didn't: dots at the corners of
  dimmed buttons, and file details cut short.
- What the stand-ins replace isn't tested: how REAPER reads files, MIDI from
  REAPER, what Print does, what fonts the system gives, and which keys REAPER
  passes on. CLAUDE.md lists these.
- Text widths in the previews are estimated, so how text is cut short there
  isn't how REAPER will cut it.
- `loose_eel` is built locally rather than committed. The README says how to
  build it.
