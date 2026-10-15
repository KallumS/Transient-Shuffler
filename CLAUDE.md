# Transient Shuffler

A REAPER plug-in (JSFX) that gives one sample the attack of another: drop two
samples on its window and the result keeps A's body (its sustain and tail)
and takes B's attack, or the other way round. Heard from the window or with
MIDI, kept with **Print** (a new item in the project).

The user is not a developer. Explain in plain words, show pictures of what
changed (`tests/render_preview.py`), and keep the README's "Use" section true:
it is how they learn the plug-in.

## Where the reasons are

- **[`docs/decisions/`](docs/decisions/README.md)** - one record per choice
  someone could reasonably make the other way. Referred to by number:
  **(0003)** is `docs/decisions/0003-a-crossfade-that-holds-its-level.md`.
  Not edited to stay true: a reversed decision keeps its text and gains a
  pointer to the one that replaced it.
- **[`docs/sessions/`](docs/sessions/README.md)** - one log per working
  session: the route, the mistakes, what looked broken and was not, what is
  still missing.
- **[`docs/apple-hig-review.md`](docs/apple-hig-review.md)** - the plug-in
  checked against all 19 pages of Apple's HIG Foundations (0010).

Write to these when something changes. A rule here without its reason gets
undone.

## Shape of it

Everything is one file, `TransientShuffler.jsfx`, in sections:

| Section | What it does |
| --- | --- |
| `@init` | The memory map, the house colours, and every function: loading (`load_into`, `load_slot`, `replace_slot`, `undo_change`), analysis (`find_onset`, `make_hybrid`, `recompute`), `housekeeping`, voices, `print_result`, and the drawing and controls (`ui_button`, `ui_toggle`, `ui_slider`, `draw_wave`...). |
| `@slider` | Any parameter change marks the results for recomputing. |
| `@block` | MIDI note-ons start voices; Play/Stop from the window arrive here as counters; loading and recomputing happen here while the window is closed (0007). |
| `@sample` | Eight voices, summed, plus the input if *Pass input audio through* is on. |
| `@serialize` | The two file paths, the view and the interface size. Never the audio (0005). |
| `@gfx` | The window: layout, dropped files, the bar (messages, Undo, Options), the controls, the three waveform rows, mouse and keys. |

| Sound | Index | Memory |
| --- | --- | --- |
| Sample A | 0 | `A_L`, `A_R` |
| Sample B | 1 | `B_L`, `B_R` |
| A with B's attack | 2 | `H1_L`, `H1_R` |
| B with A's attack | 3 | `H2_L`, `H2_R` |

Each sound is planar stereo of up to `MAXLEN` (800 000) frames; per-sound
facts are small tables indexed by that number (`s_len`, `s_on` the hit,
`s_pk`, `s_lag`, `s_pol`, `s_gain`...). `SCRATCH` (2 x `MAXLEN`) is shared by
loading and printing. Everything ends below 8 388 608 words, a JSFX's
memory; a test checks it.

`tests/` runs the plug-in's own code outside REAPER (0008):
`run_tests.py` splits the file into its sections, swaps REAPER's calls for
stand-ins and drives it with `tests.eel`; `render_preview.py` draws the
window to PNGs.

## Working in it

```sh
# once: WDL's EEL2 interpreter (github.com/justinfrankel/WDL, WDL/eel2)
make NO_GFX=1 MAXLOOP=1048576 loose_eel
# every change: 677 checks, at the real MAXLEN and a small one
python3 tests/run_tests.py path/to/loose_eel
# after any drawing change: look at it
python3 tests/render_preview.py path/to/loose_eel out/
```

- **Look at a render after any drawing change.** Text widths there are
  estimated (bytes x size), so a name cut short in the preview may fit in
  REAPER; everything else is the plug-in's own layout.
- **When fixing a bug, have a test fail on the old code first.**
- **Commit and push early.** The container can restart mid-session.
- reaper.fm is blocked by this environment's network policy. Check JSFX
  calls against real code instead: Saike's (github.com/JoepVanlier/JSFX) and
  ReaTeam's (github.com/ReaTeam/JSFX) collections, cloned to the scratchpad,
  and WDL's `eel_lice.h` / `eel_strings.h` for gfx and string functions.
- Nothing can be tried in REAPER from here. Say so whenever a change rests on
  a REAPER behaviour the tests stub out.

## Rules that are easy to break

- **EEL2 is not C.**
  - `||` and `&&` have equal precedence, and so do `|`, `&` and `~`: bracket
    every mix.
  - `~` is XOR. There is no bitwise NOT.
  - `?:` binds tighter than `=`: write `c ? (x = 1) : (y = 2)`.
  - Variable names ignore case: `aL` and `al` are the same variable.
  - A loop stops after about a million passes, without saying so. `MAXLEN`
    stays under that.
- **Functions go in `@init`.** The test harness wraps every other section in
  a function, and EEL can't nest them.
- **A REAPER call that hands values back through its arguments**
  (`file_riff`, `midirecv`, `gfx_measurestr`) is rewritten by `adapt()` in
  `run_tests.py` and `render_preview.py`. Change that call, change those.
  Every other REAPER call needs a stand-in in `STUBS`, with the same number
  of arguments.
- **Heavy work stays off the audio thread** (0007). Loading and recomputing
  run from `@gfx`, and only fall back to `@block` while the window is closed.
- **A parameter changed from the window** is set, then
  `slider_automate(mask)` is called, then `dirty = 1` if it changes the
  sound. The masks are:
  - 1 Attack length;
  - 2 Crossfade;
  - 4 Attack trim;
  - 8 Match level;
  - 16 Align phase;
  - 32 Hit threshold;
  - 64 Result;
  - 128 MIDI notes play;
  - 256 Output;
  - 512 Pass input through.

  The variable is still called `onset_db`, though the control is now
  *Hit threshold*.
- **Replacing or clearing a sample goes through `begin_change()` and
  `replace_slot()`.** That way Undo can put the old sample back. Never
  `strcpy` into `#pathA` / `#pathB` directly, except in `undo_change`.
- **Messages stay until dismissed** (0010). Don't put a timer on `#status`.
- **Every new control:**
  - registers for Tab (`focusable`);
  - can be pressed or moved from the keyboard;
  - draws a focus ring;
  - gives a hint that starts with its own name;
  - is at least 28 px tall (20 px is the least), with 12 px between it and
    the next one.

  `ui_button`, `ui_toggle` and `ui_slider` already do all of this.
- **Every gesture has a control that does the same thing.** Dragging the
  splice is *Attack length*; clicking a waveform is the Play buttons;
  scrolling is *View*. Dropping a file has none, because JSFX has no file
  dialog.
- **Nothing that matters at the bottom of the window** (Apple: people drag
  windows off the bottom of the screen). The controls go at the top.
- **Never commit Apple's guideline pages** (0011). The repository is public
  and they are Apple's copyrighted text.

## Colour

The house scheme, taken from Miderator's `Theme.h` (0009):

- a dark cool-grey background (`GROUND #23272E`);
- light grey controls (`CONTROL #A9AFBA`) with dark text on every button
  (`INK #14171C`);
- one yellow (`ACCENT #FFF200`), only for what is on, chosen or sounding,
  never for hover or dragging;
- every grey blue-shifted (R < G < B).

Text uses `TEXT`, `LABEL2` (7.3:1) or `WARN_TEXT` (7.5:1) for errors. The
house red `WARN #D2483F` is only 3.4:1, so it marks things but is never used
for text. The window is always dark.

## Where it stands

Version 1.0, built in the 2026-10-15 session, then reviewed against Apple's
HIG and reworked. It is on the branch `claude/loving-carson-xcyc30`, with no
pull request yet.

**It hasn't been tried in REAPER yet.** These depend on REAPER behaviour the
tests stub out:

- what `export_buffer_to_project`'s track argument of `-1` does;
- whether `file_riff` reads files other than WAV;
- whether `gfx_getfont(#str)` works and `.AppleSystemUIFont` resolves on
  macOS;
- whether REAPER passes Tab and the arrow keys to the window;
- whether `file_open` works from `@block`.

The latest session log's "Not done yet" lists the rest.
