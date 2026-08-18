# Changelog

All notable changes to carve-skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

- Add target/version discovery, a machine-readable capability matrix,
  non-installing validator discovery, localized-edit and PR-body workflows,
  quality/security guidance, behavioral render fixtures, documentation-link
  checks, and published-bundle integrity tests.

- Qualify the comment trap in `references/traps.md` (6) with the block/inline
  split the spec now states, so `%%` stops reading as reliably invisible. An
  inline comment is an inline construct, so an unclosed verbatim run publishes
  its text; a verse comment is a block settled at column 0, so an indented `%%`
  inside a `::: |` is content. Both hold on 0.1.2. The shape where the two meet,
  a comment-only verse line under an unclosed run, is hidden on `main` and
  published on 0.1.2, and carries a status block until a release past 0.1.2
  ships.

- Advance the spec submodule to carve `881134e` and cover the divergence
  section it brings in `references/traps.md`: footnote labels are matched
  exactly (21) - no whitespace normalization, no trimming of the ends, and a
  reference may not wrap across lines, so only a reference written the way the
  definition was written binds.

- Record in `references/traps.md` (7) that fence and `:::` closers and bare
  images are excluded from paragraph interruption alongside list markers, and
  point at trap 18 for the attribute line, which is the one case where the two
  languages differ by more than block position.

- Correct the smart-typography host options in `references/traps.md` (12). It
  named a `CarveConverter::create(smartTypography: ...)` parameter and a
  `with_smart_typography(...)` builder that no engine has; the real spellings
  are `setSmartTypography(SmartTypographyMode::Source)` on a carve-php renderer
  and the `smart_typography` field on carve-rs `Options`, both also reachable as
  `--smart-typography source`.

- Note in `references/traps.md` (13) that spec section 13 has moved past what
  the trap describes: the container rules there are those of
  `@markup-carve/carve` 0.1.2, the only published engine, and the section flips
  when 0.1.3 ships.

- Advance the spec submodule to carve `92bef65` and cover the three divergence
  sections it brings in `references/traps.md`: smart typography always runs and
  keeps the author's source (12), containers nest by width and an unclosed one
  stays text (13), and headings are single-line (14, spec
  markup-carve/carve#451).

- Advance the spec submodule to carve `0.1.1` and cover the two new
  divergence sections in `references/traps.md`: raw passthrough is
  target-routed (10) and list continuation requires the content column /
  strict column-0 (11).

## [0.1.0] - 2026-07-15

First release.

### Added

- `SKILL.md` agent-authoring skill for Carve: trigger description, the Markdown/Djot traps, a quick syntax card, extension awareness, and the `carve lint` validation loop.
- Reference files: `references/traps.md`, `references/syntax.md`, `references/extensions.md`, `references/validation.md`.
- Drift guard (`test/drift.test.mjs`) that fails if the skill diverges from the vendored spec docs, plus a round-trip `examples/showcase.crv` that must lint clean.
