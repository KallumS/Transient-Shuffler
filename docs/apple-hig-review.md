# Review against Apple's Human Interface Guidelines: Foundations

This review checks Transient Shuffler against all 19 Foundations pages,
fetched from developer.apple.com in October 2026. The pages in the zip were
saved without their content, so the Markdown versions Apple publishes were
used instead.

The plugin draws its own window inside REAPER, so some guidance can't apply.
JSFX can't reach macOS accessibility features (VoiceOver, Dynamic Type,
Increase Contrast), can't open a file dialog, and can't read the system's
appearance setting. Where a guideline couldn't be met for that reason, this
review says so rather than counting it as met.

## What changed

| Guideline | Before | Now |
| --- | --- | --- |
| **Design principles: help people recover from mistakes** | Dropping a file on a full slot, or clearing one, lost the old sample. | The message bar says what changed and offers **Undo**. |
| **Accessibility: keyboard alone** | Mouse only, apart from a few shortcut keys. | Tab and Shift+Tab move through every control in reading order, with a visible focus ring. Return or Space presses a button or checkbox. The arrow keys move a slider, and Shift makes the steps finer. Esc lets go of the focus. |
| **Accessibility: let people control playback** | Play could start a sound but nothing could stop it except Esc. | Play becomes **Stop** (a square icon) while its sound plays. With nothing focused, Space plays or stops the result. |
| **Accessibility: avoid time-boxed elements** | Messages disappeared after 4 seconds. | Messages stay until you press **Dismiss**, or until a newer message replaces them. |
| **Accessibility, Color, Dark Mode: contrast** | Errors were 3.4:1, the "unused" labels 3.5:1, the drop-zone border 1.4:1, the unused waveform 2.7:1, and secondary text 4.7:1. | Body and secondary text are at least 7:1 (Apple's target for small custom text), and errors are 7.5:1. Waveforms and borders are at least 3:1. The house red still marks things but is no longer used for text. |
| **Accessibility, Typography: larger text** | Fixed sizes. | **Options → Interface size** offers 100%, 125%, 150% or 200%, and the window remembers it. The controls rearrange into two or three columns when they no longer fit four across. |
| **Typography: sizes and system font** | Arial, with 12 px secondary text. | The system font: San Francisco on Mac, Segoe UI on Windows. The plugin checks which font it was actually given and falls back to Arial. Text is 13–14 px, Apple's macOS default being 13 pt. |
| **Typography: keep truncation to a minimum** | Long file names were cut short. | Hovering over a name shows it in full. The file details line is shorter, so it fits. |
| **Layout (macOS): no controls at the bottom of a window** | All the controls sat along the bottom edge. | The controls now sit at the top, above the waveforms. The message bar and Options are above them. |
| **Accessibility: control size and spacing** | Some buttons were 26 px tall with 6–8 px gaps. The splice line could only be grabbed within a 10 px strip. | Buttons are 28 px tall (Apple's macOS default) with 12 px between them. The splice line can be grabbed within 20 px. |
| **Color: one colour, one meaning** | Yellow meant "on" or "sounding", but also marked the splice line while it was dragged. | Yellow only means on, chosen or sounding. The splice line stays white and gets wider when it can be dragged. |
| **Color, Accessibility: more than colour alone** | The parts of A and B left out of the result were shown only by a darker shade. | The labels also say so: "attack (unused)", "body (unused)". |
| **Branding: let branding defer to content** | A large title repeated the name REAPER already shows in the window's title bar. | The title is gone, and that space now holds the message bar. |
| **Writing: errors near the problem, saying what to do** | Errors said "Try WAV…" and appeared only in a line at the top. | The error also appears in the row it applies to, and says what to do: "Couldn't read Broken.wav. Drop a WAV, AIFF, FLAC, MP3 or OGG file here." |
| **Writing, Inclusion: define technical terms** | "Onset threshold", with hints that didn't name the control. | Renamed **Hit threshold**. Each hint now starts with the control's name and then says what it does. |
| **Familiarity: build on what people know** | Play buttons were text only. | Play and Stop now have the usual triangle and square icons next to their labels. |

## Already met

- **Purpose and simplicity.**
  - The window does one thing.
  - Rarely used settings are in Options: pass-through, what MIDI plays,
    interface size and clearing a sample.
- **Agency.**
  - You can play or edit anything in any order.
  - The original sample files are never changed.
  - Printing adds a new item, which REAPER's own Undo can remove.
- **Feedback.**
  - Buttons and other controls change as you hover over them and press them.
  - Anything you can't use yet is dimmed, not hidden.
  - What's sounding shows in yellow, and a line moves across the waveform as
    it plays.
- **Every gesture has another way to do it.** Each one has a button or
  control that does the same thing:
  - dragging the splice line: Attack length;
  - clicking a waveform: the Play buttons;
  - scrolling to zoom: the View buttons.
- **Hierarchy and grouping.**
  - The window reads top to bottom: controls, then sample A, sample B, the
    result, and a time ruler.
  - A line separates the controls from the waveforms.
  - All three waveforms share one time axis, so the splice lines up across
    them.
- **Writing.**
  - Labels are plain and in sentence case.
  - Buttons are verbs: Play, Stop, Print, Undo, Dismiss.
  - Messages talk to you directly and never say "we".
  - Empty rows say what to do next.
- **Motion.** There are no animations, so nothing needs to change for Reduce
  Motion.
- **Dark Mode.** The window is always dark. Apple allows this for apps built
  around viewing media ("in rare cases, consider using only a dark
  appearance"). It is also the house scheme, and a JSFX can't read the
  system's appearance setting.
- **Privacy.**
  - Nothing is collected or sent anywhere.
  - The only thing stored is each sample's file path, saved in your REAPER
    project so the samples reload when you reopen it.

## Not met, because a JSFX can't

- **VoiceOver, Voice Control and Switch Control.**
  - These can't read a JSFX's custom-drawn window.
  - Every setting that changes the sound is also a REAPER parameter,
    which screen readers can reach through REAPER's FX parameter list (for
    example with the OSARA extension).
- **Dynamic Type and Increase Contrast.** A JSFX can't read these system
  settings. Interface size and the higher-contrast colours make up for them.
- **Loading samples without dragging.**
  - JSFX has no file dialog, so the only way to load a sample is to drop a
    file on the window.
  - This is the one gesture with no keyboard alternative.
- **Right to left.** A JSFX can't be translated, so the window is English
  only. Time runs left to right as it does in every DAW.

## Not relevant

These pages cover things this plugin doesn't have:

- Materials (Liquid Glass);
- App icons;
- Icons and SF Symbols (beyond the play and stop icons above);
- Images;
- Spatial layout and Immersive experiences (visionOS).

## Added since

2026-10-25: *Find attack* and *Snap to zero crossings* (decisions 0012 and
0013) meet the same rules as everything above:

- **Built the same way.** Both are checkboxes made by the same code as the
  others, so they are reached with Tab, pressed with Return or Space, and
  draw a focus ring.
- **Hints.** Each hint starts with the control's name and says what it does.
- **Feedback.**
  - Attack length shows what was found ("7.0 ms, found").
  - It shows where snapping moved the splice ("31.3 → 29.9 ms").
  - Marks under A and B show where each attack ends.
  - Each mark is a shape as well as a colour.
- **Your choice wins.** Choosing the splice by hand turns Find attack off,
  rather than having the two fight.

The window now opens at 820 × 704, so the third row of controls fits. The
controls still sit above the waveforms.

## Checked by

- `tests/run_tests.py` runs the plugin's own code through 797 checks. These
  cover keyboard focus, arrow keys, Play turning into Stop, Undo, messages
  staying until dismissed, interface size, choosing the font, and the
  controls sitting above the waveforms.
- `tests/render_preview.py` draws the window in every state described here.
