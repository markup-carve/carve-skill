---
name: carve-authoring
description: Author, edit, review, lint, explain, render, publish, or migrate Carve (`.crv`) files or snippets in issues, PRs, and chat. Use for Carve syntax, diagnostics, outputs, or conversion; not ordinary Markdown/Djot, whose emphasis and sup/sub differ.
---

# Working with Carve

## Before drafting

- Write table headers as `|= Name |= Qty |`, never with a `|---|` separator.
- Put `^ Caption` directly after its block.
- Write definitions as `:: term` followed by `: definition`.
- Leave a blank line between prose and a list.
- Use `/italic/` and `*bold*`; `**bold**` is literal and `_italic_` underlines.
- Use `::: warning` or `::: note`, never `> [!WARNING]`.
- Run `carve fmt` on what you wrote, then `carve fmt --check`.

## Route

Use `.crv` and core syntax by default. Check version boundaries in
[capabilities.json](references/capabilities.json), syntax in
[syntax.md](references/syntax.md), and review or migration steps in
[workflows.md](references/workflows.md).

## Essential dialect differences

Carve differs from Markdown/Djot in other ways:

- `~strike~` is strikethrough and `=highlight=` is highlight; `~~strike~~` is literal.
- superscript and subscript are braced-only: `{^sup^}` and `{,sub,}`; bare
  `^sup^` and `,sub,` are literal.
- heading attributes precede the heading; `+` continues a container and is not
  a bullet; a lone `-` is paragraph text.
- cross-references are `</#id>`, comments are `%%` or fenced `%%%`, and a fence
  must be longer than any bare same-character fence line inside it.
- a fence has no space before its language (```` ```js ````); attributes like
  `{.diff}` go on the line above.
- glue table alignment to the header marker (`|=<`, `|=~`, `|=>`).

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
preview edits with its AST tools. Otherwise run the project's
`carve lint` on touched files; lint accepts non-canonical spellings.
Use the matching version, never install one, and verify failures are detected.
Report command and version. See [validation.md](references/validation.md).

## Preserve intent and safety

Preserve nearby syntax and layout unless asked to canonicalize.
For issue, PR, or chat bodies, widen the outer Markdown fence beyond every bare
fence in the Carve sample and preview it.

Use logical headings and useful link/alt text. Treat raw output, embeds, and
renderers as trust boundaries. Read
[quality-and-safety.md](references/quality-and-safety.md) for safety or
[reader-focused.md](references/reader-focused.md) for editorial review.
