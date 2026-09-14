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

Do not rely on Markdown/Djot habits. In Carve:

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

For unfamiliar syntax, use [syntax.md](references/syntax.md) or a relevant trap
guide: [foundations](references/traps-foundations.md)
for ids/lists/emphasis/comments; [blocks](references/traps-blocks-containers.md)
for interruption/symbols/definitions/raw/columns/typography/containers/fences;
[structure](references/traps-structure-references.md) for
headings/attributes/admonitions/footnotes; then
[migration](references/traps-migration.md) for a final Djot conversion pass.
Use [extensions.md](references/extensions.md) only for host-dependent Tier-2 or
Tier-3 features.

## Validate

When Carve MCP is available, prefer its versioned resources and `carve_lint`;
preview structural edits with its AST patch tools. Otherwise lint touched files
with the matching-version local binary:

```sh
./node_modules/.bin/carve lint file.crv
```

Do not install a validator solely for the task. Prefer a project script/local
binary, then `npx --no-install carve`; use global `carve` only at the matching
version. Report command and version. Inspect parsed/rendered output when
structure or target routing matters. See [validation.md](references/validation.md).

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
