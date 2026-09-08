---
name: carve-authoring
description: Write or edit Carve (`.crv`) documents or Carve snippets in issues, PRs, and chat. Use when asked to author Carve, not ordinary Markdown or Djot; emphasis and sup/sub syntax differ.
---

# Authoring Carve

Mnemonic: “the markup looks like its output.” Use `.crv` exclusively.

## Route before writing

Determine the version, output target, extensions, and spelling-preservation
needs. When unknown, use core syntax; consult
[syntax.md](references/syntax.md) for unfamiliar constructs. Check version
boundaries in [capabilities.json](references/capabilities.json) and task
procedures in [workflows.md](references/workflows.md).

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

For unfamiliar syntax, read:

- [syntax.md](references/syntax.md) for the complete core syntax card.
- Open a relevant trap guide: [foundations](references/traps-foundations.md)
  for ids/lists/emphasis/comments; [blocks](references/traps-blocks-containers.md)
  for interruption/symbols/definitions/raw/columns/typography/containers/fences;
  [structure](references/traps-structure-references.md) for
  headings/attributes/admonitions/footnotes; then
  [migration](references/traps-migration.md) for a final Djot conversion pass.
- [extensions.md](references/extensions.md) only for host-dependent Tier-2 or
  Tier-3 features.

## Validate

Lint every touched Carve file with the project-local matching-version binary:

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
boundaries. Read [quality-and-safety.md](references/quality-and-safety.md) when
the document uses those features or has accessibility/security requirements.
