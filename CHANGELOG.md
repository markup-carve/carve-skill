# Changelog

All notable changes to carve-skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
