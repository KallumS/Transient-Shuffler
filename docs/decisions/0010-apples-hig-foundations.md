# 0010 - Apple's HIG Foundations are the standard for the window

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

The user asked for Apple's Human Interface Guidelines to be followed, then
sent all 19 Foundations pages. The pages in their zip had been saved without
their content, so the Markdown versions Apple publishes were fetched instead.
Checked against them, the first version fell short in several places (see
[`docs/apple-hig-review.md`](../apple-hig-review.md)).

## Decision

- **Recovering from mistakes.** Replacing or clearing a sample offers Undo.
  Messages stay until dismissed, not on a timer.
- **The keyboard alone.**
  - Tab and Shift+Tab move through every control in reading order, and a
    focus ring shows where you are.
  - Return and Space press the focused control.
  - The arrow keys move a slider, with Shift for finer steps.
  - Esc lets go of the focus and stops playback.
- **Playback you can stop.** Play becomes Stop while its sound plays.
- **Contrast.**
  - Text is at least 7:1 against its background, Apple's target for small
    text. Secondary text is `LABEL2 #B0B6C0`, errors `WARN_TEXT #FF9E96`. The
    house red marks things but is no longer used for text.
  - Waveforms and borders that carry meaning are at least 3:1.
- **Text size.** Options offers an interface size of 100%, 125%, 150% or
  200%, and the window remembers it. The controls rearrange from four columns
  into three or two when they don't fit.
- **The system font.** San Francisco on Mac, Segoe UI on Windows, Arial
  otherwise. The plug-in asks `gfx_getfont` which face it actually got.
  Text is 13–14 px.
- **Layout.** Apple says not to put controls at the bottom of a Mac window,
  so the controls sit at the top. The large title is gone, because REAPER's
  title bar already shows the name.
- **Control size.** Controls are 28 px tall with 12 px between them, and
  the splice line can be grabbed within 20 px.
- **One colour, one meaning.** Yellow only means on, chosen or sounding. The
  splice line stays white and gets wider when it can be dragged.
- **Not colour alone.** The parts of A and B left out of the result are
  labelled "(unused)", not just drawn dark.
- **Errors.** An error appears in the row it belongs to and says what to do.
  *Onset threshold* became *Hit threshold*. Each hint starts with its
  control's name.

## Consequences

- Every new control has to meet the same bar: CLAUDE.md lists what that
  means.
- **Not met, because a JSFX can't:**
  - VoiceOver, Voice Control and Switch Control can't read a window a JSFX
    draws itself. Every setting that changes the sound is also a REAPER
    parameter, which screen readers can reach.
  - Loading has no keyboard path (0001).
  - The plug-in can't follow Dynamic Type or Increase Contrast.
  - It can't be translated.
- **At 200% in a small window**, the waveforms run off the bottom. The window
  needs enlarging.
- **Unverified in REAPER:**
  - whether `gfx_getfont` accepts a string, as WDL's `eel_lice.h` does;
  - whether `.AppleSystemUIFont` gives San Francisco;
  - whether REAPER passes Tab and the arrow keys to the window.
