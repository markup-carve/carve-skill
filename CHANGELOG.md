# Changelog

All notable changes to carve-skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-07-15

First release.

### Added

- `SKILL.md` agent-authoring skill for Carve: trigger description, the Markdown/Djot traps, a quick syntax card, extension awareness, and the `carve lint` validation loop.
- Reference files: `references/traps.md`, `references/syntax.md`, `references/extensions.md`, `references/validation.md`.
- Drift guard (`test/drift.test.mjs`) that fails if the skill diverges from the vendored spec docs, plus a round-trip `examples/showcase.crv` that must lint clean.
