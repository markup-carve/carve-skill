# Changelog

All notable changes to carve-skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

- Cover divergence 14, single-line headings (spec markup-carve/carve#451): a
  heading ends at the newline, so prose beneath it is a paragraph and the
  auto-id comes from the heading line alone. Documented ahead of the spec
  submodule, which the drift guard allows; sections 12 and 13 still need
  covering when that pin moves.

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
