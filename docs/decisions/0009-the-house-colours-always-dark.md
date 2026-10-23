# 0009 - The house colours, always dark

- **Date:** 2026-10-15
- **Status:** Accepted. 0010 adds two text colours and narrows what yellow
  means.

## Context

The user asked for the house colour scheme, pointing to Miderator as the
example. Miderator's `Theme.h` holds it (Good Idea's `docs/COLOUR.md`, shared
by the family). A JSFX can't read whether the system is set to light or dark.

## Decision

The same values as Miderator's dark look:

- the ground `#23272E`;
- a sunken `#1A1D23` and the roll `#111419` behind the waveforms;
- controls `#A9AFBA`, with hover and pressed shades;
- dark text `#14171C` on every button;
- text `#DDE1E7`;
- yellow `#FFF200`;
- red `#D2483F`.

Every grey is blue-shifted (R < G < B). The waveforms are drawn the way
Miderator draws notes: parts that are used light, parts that aren't dark.
There is no light look.

## Consequences

- The plug-in sits beside the family's apps and looks like one of them.
- Apple allows an always-dark interface for apps built around media. A
  setting for it inside the plug-in would also go against Apple's advice
  ("avoid an app-specific appearance setting").
