# Carve 0.2 workflows

## New document

Choose the 0.2 target, HTML host options, include resolver, and extensions. Draft with [syntax](syntax.md), then run the 0.2 CLI `lint`, `fmt --check`, and `render`. Check source structure and rendered HTML. Use a blank line before a block that should start after prose.

## Local edit

Read the nearby paragraph, list, quote, fence, and attribute boundaries. Make the smallest edit that preserves the intended tree. Run `lint` and `fmt --check` on the touched document; render around any change to structure, references, table spans, or raw content. `fmt --write` is a source rewrite, so review its diff.

## 0.1 migration

Use [migration](traps-migration.md). Work on a copy, run the reference engine's `upgrade --check` and `upgrade --json`, inspect silent HTML changes, then apply once and compare 0.1 and 0.2 HTML. Migrate integrations and stored trees separately.

## HTML import

The 0.2 shared CLI imports HTML. Inspect the diagnostics and render-loss record before accepting the generated Carve source. HTML input has no guarantee of retaining every source distinction. For Markdown source, first render it to HTML with the intended Markdown renderer and then import HTML; the old 0.1 Markdown importer is not a 0.2 core workflow.

## Includes

Choose a permitted root and resolver. Verify selectors, heading shifts, dependencies, and failed resolutions under [include rules](../spec/spec/0.2/includes.md). `fmt` leaves include directives unexpanded. A host without a resolver cannot promise expanded content.

## Issue, PR, or chat body

The enclosing GitHub or chat body is Markdown even when its sample is Carve. Use a `crv` fence longer than any backtick fence inside the sample. Lint and format the Carve bytes inside it. When showing HTML, render the exact source with the named options.

## Publishing

Publish the HTML result with an explicit URL policy, raw HTML setting, and extension set. Check headings, alt text, links, captions, tables, and responsive reading order. The 0.2 shared writer produces Carve; 0.1 Markdown, plain, and ANSI writer claims do not apply.
