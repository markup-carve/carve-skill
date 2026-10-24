# Changelog

All notable changes to carve-skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.7] - 2026-10-24

The skill now describes the pinned spec's Markdown export losses and how to check whether an installed engine reports them.

### Fixes

- Markdown export guidance distinguishes default losses from roundtrip carriers, including escaped raw HTML, and explains when source checks can report an unattached attribute run (#188).

**Full Changelog**: https://github.com/markup-carve/carve-skill/compare/0.1.6...0.1.7

## [0.1.6] - 2026-10-23

### Fixes

- Include regions follow the include mode: a Carve include takes only
  `%% #region name`, source files are included with `@code`, and a `#region`
  line in a Carve file is reported as `region-marker-renders-as-text` (#181,
  #182).
- The continuation marker is taught at relative column 0: a nested item's own
  marker column, or right after `> `. `>+`, `>>+` and `>> +` are text (#182).
- The first-block form (`> +`, `: +`, `[^a]: +`) pulls one non-list block at
  column 0 or the opener's column; a column-0 list stays outside (#182).
- `include-selection-conflict` is named for combined include selectors (#178).

### Improvements

- Read against spec 0.1.11 and tested on carve-js 0.1.13: code includes,
  `{table}` above a `csv` or `tsv` include, include lint under
  `--include-root`, and the lint rules `unclosed-code-fence`,
  `continuation-marker-refused`, `list-marker-below-content-column`,
  `ordered-list-split-by-indent` and
  `description-separator-below-content-column` (#175, #177, #182).
- The `.scroll` carve-css recipe and the include trust boundary in the safety
  guide (#182).
- The validation guide names `carve fmt --align-tables --check` for projects
  that keep aligned tables (#184).

## [0.1.5] - 2026-10-14

### Fixes

- The table example no longer puts a rowspan `^` in the first row, where it
  renders as an empty cell (#170).
- Trap 7 says a code or raw fence interrupts a paragraph only with a valid
  opener and a matching closer (#170).
- Definition examples use the canonical one space after `:` (#170).
- Smart typography recommends `-->` and `==>`; `->` is listed as deprecated
  (#170).
- Trap 14 shows the heading id on the `<section>` wrapper, where the engine
  puts it (#170).
- Trap 12 says switching smart typography off applies to every target, plain
  text and ANSI included (#167).
- A GFM table separator row is a second header spelling the spec keeps, not an
  alias (#167).
- Quote and footnote first-block markers are now described as supported by the
  0.1.11 engine, and footnote labels with tabs are described as distinct from
  labels with spaces (#173).
- Footnote references inside links use a bare superscript; blocked table spans
  report their lint rule in the released engine (#173).
- Attribute tabs and round-trip carriers are described against the released
  0.1.11 engine (#173).

### Improvements

- The spec pin moves to the published 0.1.9 revision, 5484177a (#173).
- Traps 1b and 1c (heading-id punctuation, only the id moves to `<section>`)
  and the `- +` / `: +` / `> +` / `[^a]: +` first-block form (#170).
- A table-cells section (span limits, head-row alignment, blank-cell rows,
  vertical alignment) (#170).
- Notes on attribute tabs, footnote references in link text, tight attributed
  paragraphs, `carve render --roundtrip`, the `i.` / `j.` list ambiguity and the
  soft-deprecated `:name[…]` spelling; unreleased spec rules are marked
  (#170).
- Trap 12 and the migration checklist: Djot's forced quote markers `{"`, `"}`,
  `{'`, `'}` are not Carve (#167).
- Trap 5: the ordered-list delimiter reaches the output as `data-delim` on the
  `<ol>` (#165).
- The safety checklist separates `{#...#}` editorial comments, which plain text
  and ANSI write into the output, from `%%` comments, and says a suppressed
  `=html` block renders as a fenced code block (#165).

## [0.1.4] - 2026-10-08

### Fixes

- Two guidance entries said the released engine disagreed with the spec, and it
  no longer does. `traps-foundations.md` carried an "Ahead of the engine" note
  saying 0.1.9 still folds case for a cross-reference; `@markup-carve/carve`
  0.1.10 leaves `</#getting-started>` literal next to `Getting-Started`.
  `syntax.md` and `validation.md` said a curly-quoted fence title drops the
  whole opener line to a paragraph on a released engine; 0.1.10 recovers,
  keeping the container with its body as content while still reporting
  `fence-title-syntax`. Both measured on 0.1.9 and 0.1.10.

### Changed

- Read against `@markup-carve/carve` 0.1.10, from 0.1.9. Every dated claim in
  `references/` was re-run on both engines rather than renumbered: the vertical
  cell alignment pair, admonition naming, nested admonitions, the canonical form
  of a quoted note in a list item, the placement diagnostics (`footnotes`
  reported, `bibliography` and `references` still silent), a titled placing
  marker, the delimited comment, `fence-opener-fallback`,
  `table-alignment-run-padding`, the merged `class=` slot, the term-fold render,
  the GFM heading rewrite, `lintCarve` against the CLI, and the CLI's exit code
  through the `.bin` symlink are all unchanged, so their attributions moved with
  evidence. `references/capabilities.json` names 0.1.10, which its own per-feature
  probe now holds it to.
- The published progressive-disclosure table is re-measured: the routine profile
  is 2487 GPT-5 tokens, foundations 4193, largest migration 6269.

## [0.1.3] - 2026-09-30

### Fixes

- A definition description can hold several blocks, including paragraphs
  separated by a blank line, as long as each continuation reaches its content
  column. The guide said the opposite: that a blank line ends the definition and
  Carve has no multi-paragraph `<dd>` (#136).
- The vertical table-cell alignment example now shows a right-aligned column
  whose `?v` cell keeps `right`. It had paired a left-aligned column with a
  claim of `text-align: right`, which no engine renders (#127).
- `examples/showcase.crv` is now what `carve fmt` writes, so a construct copied
  out of it passes the check the skill tells agents to run. Four hunks failed
  it, and `CARVE-P11-030` settled the `+` continuation marker against the
  example rather than against the formatter (#130).
- Corrected the guidance where it had fallen behind the released engine,
  measured against `markup-carve/carve` 0.1.9 (#138):
  - ```` ```js {.diff} ```` and a block opener folded into a definition term
    are reported now, where lint had been silent on both.
  - A `::: footnotes` marker written inside a container is reported;
    `::: bibliography` and `::: references` still are not, so those two need
    the render read.
  - A placing marker keeps a quoted title and an opener label instead of
    dropping them, so a title is safe to write.
  - Markdown export writes the bare heading and a GFM-slug link in place of a
    `{#h}` suffix a GFM reader would show as literal text.
  - `.class` mixed with `class=VALUE` produces one merged class attribute
    rather than two.
  - `./node_modules/.bin/carve lint` reports findings and exits `1` through the
    symlink, so the workaround of calling `dist/cli.js` directly is now only
    for older engines.

### Improvements

- `SKILL.md` asks for `carve fmt --check` on text the agent wrote, beside
  `carve lint`. Lint accepts lenient spellings such as ```` ``` js ```` and
  reports nothing for them, so linting alone let a non-canonical sample through
  (#126).
- ```` ```js {.diff} ```` is not a fence opener: an attribute after the
  language degrades the whole block to an inline code span, so the attribute
  goes on the line above (#126).
- `_*x*_` nests two bare marks with no brace form, and a half-written pair such
  as `_*x* q` stays literal text (#127).
- `::: footnotes`, `::: bibliography` and `::: references` place a document-wide
  region only at document top level; anywhere else they render a
  `<div class="{kind}">` where they stand. `::: toc`, `::: glossary` and
  `::: index` place at any depth. A quoted title and an opener label belong to
  the placed element, except on `glossary` and `index`, where they precede the
  generated content (#132, #136).
- An authored body inside a placement marker keeps its place: footnotes and TOC
  bodies render before the generated section or nav (#136).
- A block opener indented past a definition term's containing content column
  folds into the term as text, and so do indented link and footnote
  definitions. List markers are the exception and end the term at any column
  (#136).
- `class=VALUE` writes the class slot beside `.class` tokens, which is the way
  to spell a class the dotted form cannot hold. Quote a value containing
  whitespace, braces, quotes, a backslash or a pipe, and write a literal pipe
  in a table cell as `\|` even inside quotes (#136).
- Markdown export targets GFM, so exported heading links are worth checking
  before publishing (#136).
- Includes stay off for server-side user content by default, and a containment
  denial must not disclose whether a path outside the root exists (#136).
- The findings only `carve fmt` reports are named: a bare `---` frontmatter
  opener, a definition separator padded past one space, and table cells padded
  to align a column (#130).
- The version-dated notes in `references/` describe engine 0.1.9, and the
  capability matrix records `fence-opener-fallback`,
  `footnotes-placement-in-container` and a placing marker's title as shipped
  (#138).

## [0.1.2] - 2026-09-20

### Added

- A portable installed-version check for scheduled update notifications.
- Codex UI metadata for the skill name, summary, and default invocation prompt.
- Executable task-level evaluations scoring valid Carve, meaning preservation,
  minimal edits, construct choice, and progressive-disclosure context cost.
- MCP-aware routing that uses versioned resources, lint diagnostics, migration
  reports, guarded AST patches, and stale-safe workspace previews when present,
  while retaining the matching-version local CLI fallback.
- Current MCP workflows for selected safe repairs, atomic semantic edit plans,
  multi-target checks, workspace reviews/reference graphs, guarded writes, and
  batch formatting previews, with task-level routing cases.
- A deferred reader-focused review checklist for concise, human-centered docs.
- Include safety guidance: an absolute containment root, canonicalized paths and
  symlinks, remote schemes denied by default, and finite cycle, depth, byte, and
  resolver-call limits (#114, #117).
- The processor-include spelling, and `pos.file` as the source-file identity of
  a span in an include-expanded AST (#114).

### Changed

- Recalibrated to carve 0.1.6: admonitions now carry an accessible name, and
  capability probes cover both titled and untitled forms (#110). The skill now
  tracks the spec's 0.1.6 release and is measured against engine 0.1.7, which
  changed no probed behavior and no passage that dates itself (#120).
- Broadened skill discovery to cover Carve review, linting, explanation,
  rendering, publishing, and migration tasks in addition to authoring/editing.
- Removed the redundant introductory mnemonic while keeping the default skill
  within its 800-token context budget.

### Fixed

- The extensions page points at the feature-tier table's current home (#99).
- A trap example's note sits flush with the step it belongs to instead of
  indenting into the step above (#117).

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
