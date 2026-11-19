# Carve 0.2 workflows

## New document

Choose the 0.2 target, HTML host options, include resolver, and extensions. Draft with [syntax](syntax.md), then run the 0.2 CLI `lint`, `fmt --check`, and `render`. Check source structure and rendered HTML. Use a blank line before a block that should start after prose.

## Local edit

Read the nearby paragraph, list, quote, fence, and attribute boundaries. Make the smallest edit that preserves the intended tree. Run `lint` and `fmt --check` on the touched document; render around any change to structure, references, table spans, or raw content. `fmt --write` is a source rewrite, so review its diff.

## 0.1 migration

Use [migration](traps-migration.md). Work on a copy, run the reference engine's `upgrade --check` and `upgrade --json`, inspect silent HTML changes, then apply once and compare 0.1 and 0.2 HTML. Migrate integrations and stored trees separately.

## HTML import

The 0.2 shared CLI imports HTML. Inspect the diagnostics and render-loss record before accepting the generated Carve source. HTML input has no guarantee of retaining every source distinction. For Markdown, GFM, Djot, or BBCode source, carve-js offers `carve import --from markdown` (or `gfm`, `djot`, `bbcode`) and `importDocument` from `@markup-carve/carve/import`. These importers are reference-engine features outside the shared 0.2 contract; check another engine before relying on them.

## Includes

Choose a permitted root and resolver. Verify selectors, heading shifts, dependencies, and failed resolutions under [include rules](../spec/spec/0.2/includes.md). `fmt` leaves include directives unexpanded. A host without a resolver cannot promise expanded content.

## Issue, PR, or chat body

The enclosing GitHub or chat body is Markdown even when its sample is Carve. Use a `crv` fence longer than any backtick fence inside the sample. Lint and format the Carve bytes inside it. When showing HTML, render the exact source with the named options.

## Publishing

Publish the HTML result with an explicit URL policy, raw HTML setting, and extension set. Check headings, alt text, links, captions, tables, and responsive reading order. The 0.2 shared writer produces Carve. carve-js also exports a tree as Markdown, plain text, or ANSI through `toMarkdown`, `toPlainText`, and `toAnsi` from `@markup-carve/carve/export`; each returns `output` and render-loss `diagnostics`, so read the losses before publishing. These exports are outside the shared 0.2 contract.

## MCP routing

Read the server's version first. The routes below apply when the server exposes 0.2 behavior; otherwise use the pinned 0.2 CLI and library. Choose only the resources and tools the task needs.

| Task | MCP route |
| --- | --- |
| Learn a rule | `carve://guide`, then `carve://rules/{ruleId}` for that rule |
| Check a source file | `carve_lint`; use `carve_parse` when the tree matters |
| Migrate 0.1 source | `carve_migrate`, then inspect diagnostics and output |
| Repair diagnostics | `carve_diagnose_and_fix` for proposed safe fixes |
| Plan a structural edit | `carve_plan_ast_edit`, then `carve_apply_reversible_ast_patch` |
| Guard a file write | `carve_read_file`, `carve_write_file`, and `expectedSha256` |
| Check publishing targets | `carve_check_targets` |
| Review a workspace | `carve_workspace_info`, then `carve_review_workspace` |
| Trace references | `carve_reference_graph` |
| Preview multiple edits | `carve_prepare_workspace_edits` |

Do not load every resource pre-emptively. If MCP is absent or does not serve 0.2, use the pinned engine's CLI for lint, format, and render, and inspect its library tree for structural work.
