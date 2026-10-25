# Decisions

One file per decision that would otherwise have to be argued again from
scratch: what the situation was, what was chosen, and what it costs. They are
dated and numbered, and **they are not edited to stay true**. A reversed
decision keeps its text and gains a line at the top pointing at the one that
replaced it.

`CLAUDE.md` is the working guide; these are the reasons underneath it.

| | | |
| --- | --- | --- |
| [0001](0001-a-jsfx.md) | A JSFX, not a ReaScript or a compiled plug-in | Accepted |
| [0002](0002-line-up-the-hits-and-swap-whole-sections.md) | Line up the hits and swap whole sections of sound | Accepted; crossfade placement replaced by 0012 |
| [0003](0003-a-crossfade-that-holds-its-level.md) | A crossfade that holds its level, and lines the two up first | Accepted |
| [0004](0004-match-the-attack-it-replaces.md) | Match level means the attack it replaces | Accepted |
| [0005](0005-samples-in-memory-at-the-projects-rate.md) | Samples are held in memory at the project's rate; only their paths are saved | Accepted |
| [0006](0006-hear-it-in-the-window-keep-it-with-print.md) | Hear it from the window or MIDI; keep it with Print | Accepted |
| [0007](0007-heavy-work-off-the-audio-thread.md) | Loading and recomputing happen in the window, not the audio thread | Accepted |
| [0008](0008-test-the-plug-ins-own-code-outside-reaper.md) | Test the plug-in's own code outside REAPER, and look at pictures of it | Accepted |
| [0009](0009-the-house-colours-always-dark.md) | The house colours, always dark | Accepted; added to by 0010 |
| [0010](0010-apples-hig-foundations.md) | Apple's HIG Foundations are the standard for the window | Accepted |
| [0011](0011-apples-pages-stay-out-of-the-repository.md) | Apple's guideline pages stay out of the repository | Accepted |
| [0012](0012-find-where-the-attack-ends.md) | Find where each attack ends, and keep all of it | Accepted |
| [0013](0013-snap-to-zero-crossings.md) | Snap to zero crossings, both sounds at once | Accepted |
