# 0011 - Apple's guideline pages stay out of the repository

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

The user asked for the 19 fetched HIG pages to be put in the repository.
The repository is public, and every page ends "Copyright © 2026 Apple Inc.
All rights reserved." Once pushed, they would stay in the git history even
if deleted later.

## Decision

They are not committed. The user chose to have them sent as a download
instead: a zip of 19 Markdown files, one per page, named by title. The review
(`docs/apple-hig-review.md`) refers to the guidelines by page and rule
without copying their text.

## Consequences

- To read the source, fetch the pages again. Each is at
  `https://developer.apple.com/design/human-interface-guidelines/<page>.md`,
  for example `color.md` or `dark-mode.md`.
- If the repository becomes private, this can be revisited.
