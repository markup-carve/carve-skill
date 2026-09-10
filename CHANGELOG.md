# Changelog

All notable changes to carve-skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Executable task-level evaluations scoring valid Carve, meaning preservation,
  minimal edits, construct choice, and progressive-disclosure context cost.

## [0.1.1] - 2026-09-09

### Added

- Probed capability-matrix entries for doubled arrows and vertical cell
  alignment, so a future engine change to either turns a test red rather than
  leaving the prose stale (#93).

### Changed

- Reduced default-loaded skill context from 2,189 to 769 GPT-5/o200k tokens
  (64.9%) while retaining essential dialect, validation, and safety constraints.
- Split the 8,032-token traps guide into task-routed guides of 302–3,440 tokens;
  the largest syntax + relevant traps + migration path is now 6,079 tokens
  instead of 10,370.
- Added explicit task-based routing for all conditional reference material.

### Fixed

- Recalibrated the taught syntax to carve 0.1.5. `=>` no longer converts to a
  double arrow, so the skill no longer recommends writing it; table-cell
  vertical alignment is now documented as a released feature; and four reversed
  behaviors are corrected to the 0.1.5 behavior (the `+` marker transferring a
  following flush-left block into any container, a block indented past an item's
  content column nesting, and a digit-leading class or id value being accepted)
  (#93, #95).
- One space is the canonical definition separator, matching what `carve fmt`
  produces; the card and traps page previously taught two spaces (#94).

## [0.1.0] - 2026-08-18

First release.

The skill teaches an agent to write valid, idiomatic Carve the first time. It is
a plain `SKILL.md` plus a `references/` bundle, portable to any agent that can
read a markdown skill.

### Added

- `SKILL.md`: activation guidance, the Markdown and Djot traps that make Carve
  read wrong from habit, a quick syntax card, extension awareness, target and
  engine-version discovery, localized-edit rules, and the validation loop.
- Core syntax, divergence, extension, validation, authoring-workflow,
  capability, and quality/safety references under `references/`.
- Non-installing validator discovery and explicit lint-plus-render verification
  for structure-sensitive output.
- New-document, migration, PR-body fence, complex-container, and extension
  playbooks.
- Accessibility and safety guidance for raw output, remote embeds, templates,
  and host-dependent renderers.
- `examples/showcase.crv`, linted on every run so the taught syntax is proven
  valid rather than asserted.

### How it stays correct

- The syntax card and trap list are **sourced from the spec's own docs**,
  vendored as the `spec` submodule. A drift guard fails CI when the skill falls
  behind them, so the skill cannot silently teach a retired rule.
- Every formatting rule stated in prose is **executed against the engine**, not
  merely written down.
- Behavioral fixtures lint and render emphasis, cross-references, list
  continuations, comments, and raw target routing.
- The syntax reference is held to the full essential-construct list on its own,
  so a construct cannot disappear from the page that teaches it while a passing
  mention elsewhere keeps the check green.
- A machine-readable capability matrix distinguishes released, spec-only, and
  host-dependent behavior and is checked against the pinned test dependency.
- Local documentation links and the published bundle contents are tested.
- A trap that the spec has moved past, but no released engine has yet shipped,
  **carries a status block naming the engine version it holds for**. The skill
  describes the language a reader can actually run.

Pinned to spec `22f7f47`.
