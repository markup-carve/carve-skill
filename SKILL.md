---
name: carve-authoring
description: Author, edit, review, lint, explain, render, publish, or migrate Carve (`.crv`) files or snippets in issues, PRs, and chat. Use for Carve syntax, diagnostics, outputs, or conversion; not ordinary Markdown/Djot, whose emphasis and sup/sub differ.
---

# Working with Carve

## Route

New documents use `.crv`.

Determine the version, target, extensions, and spelling preservation. Default
to core syntax. See [syntax.md](references/syntax.md) for unfamiliar constructs,
[capabilities.json](references/capabilities.json) for version boundaries, and
[workflows.md](references/workflows.md) for review, migration, publishing, and
procedures.

## Essential dialect differences

Carve differs from Markdown/Djot:

- `/italic/` is italic, `*bold*` is bold, `_underline_` is underline,
  `~strike~` is strikethrough, and `=highlight=` is highlight; these use single
  delimiters, while `**bold**` and `~~strike~~` are literal.
- superscript and subscript are braced-only: `{^sup^}` and `{,sub,}`; bare
  `^sup^` and `,sub,` are literal.
- heading attributes precede the heading; `+` continues a container and is not
  a bullet; definition entries are `:: term` then `: definition`.
- a list needs a blank line before it because list markers do not interrupt a
  paragraph, and a lone `-` without content is paragraph text.
- cross-references are `</#id>`, comments are `%%` or fenced `%%%`, and a fence
  must be longer than any bare same-character fence line inside it.
- a fence has no space before its language (```` ```js ````); attributes like
  `{.diff}` go on the line above.
- table headers use `|=`; glue alignment on (`|=<`, `|=~`, `|=>`).

For syntax, use [syntax.md](references/syntax.md) or a trap
guide: [foundations](references/traps-foundations.md)
for ids/lists/emphasis/comments; [blocks](references/traps-blocks-containers.md)
for interruption/symbols/definitions/raw/columns/typography/containers/fences;
[structure](references/traps-structure-references.md) for
headings/attributes/admonitions/footnotes; then
[migration](references/traps-migration.md) for a final Djot conversion pass.
Use [extensions.md](references/extensions.md) for host-dependent extensions.

## Validate

When Carve MCP is available, use its resources and `carve_lint`;
Preview edits with its AST tools. Otherwise run the project's
`carve lint` on touched files and `carve fmt --check` on text you wrote; lint
accepts non-canonical spellings. Use the matching version,
never install one, and verify failures are detected.
Report command and version. See [validation.md](references/validation.md).

## Preserve intent and safety

Make the smallest local edit. Preserve nearby delimiters, attributes,
indentation, line endings, and container widths unless asked to canonicalize.
For issue, PR, or chat bodies, widen the outer Markdown fence beyond every bare
fence in the Carve sample and preview it.

Use logical headings, useful link/alt text, and table headers/captions. Treat
raw output, remote embeds, templates, and extension renderers as host trust
boundaries. Read [quality-and-safety.md](references/quality-and-safety.md) for
accessibility/security or [reader-focused.md](references/reader-focused.md) for
editorial review.
