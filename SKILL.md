---
name: carve-authoring
description: Write, edit, validate, or migrate Carve 0.2 documents and snippets. Use for .crv syntax, HTML output, diagnostics, and 0.1 upgrades; not for ordinary Markdown.
---

# Working with Carve 0.2

Carve 0.2 is a development version. Use the `main` specification and a 0.2 engine for 0.2 work. Released 0.1 packages teach different syntax. Check [capabilities](references/capabilities.json) before choosing a target.

## Route

Read [syntax](references/syntax.md) for source forms. Use the focused [foundation](references/traps-foundations.md), [block](references/traps-blocks-containers.md), or [structure](references/traps-structure-references.md) guide when a construct is ambiguous. Use [extensions](references/extensions.md) for host-dependent features, [workflows](references/workflows.md) for document work, and [migration](references/traps-migration.md) when upgrading 0.1 source.

## Essential forms

- `/emphasis/` and `*strong*` are distinct. Underline, strike, and highlight use `{_x_}`, `{~x~}`, and `{=x=}`. Bare `_`, `~`, and `=` are text.
- Headings begin with `=` or `#` followed by one space. Put a blank line before a heading, quote, definition, or attribute line following paragraph text.
- A list marker needs content. `+` is ordinary text in 0.2; indent later blocks to the item's content column. List tightness follows blank lines between items.
- A thematic break is `***`. Use backtick code fences and native `|=` table headers; GFM separator rows are data.
- Attribute lines precede the block they decorate without a blank line. Cell alignment uses a brace prefix such as `|={>}`.
- Raw HTML is escaped by default. Includes need a resolver and an allowed root.

## Validate

From a built `carve-js` `main` checkout, use `node dist/cli.js lint FILE`, `fmt --check FILE`, and `render FILE`. Check `--help` in that checkout for actual flags. `lint` reports parse and lint findings; rendering and writing may report additional losses. The library entry is the package root `@markup-carve/carve`; `/import`, `/export`, and `/extensions` are separate entries. See [validation](references/validation.md).

Preserve the author's meaning when editing. For new source, write the canonical form that `fmt` emits. For a shown HTML result, render the exact source with the target 0.2 engine. Check accessibility, URLs, raw HTML, and includes with [quality and safety](references/quality-and-safety.md). Use [reader-focused review](references/reader-focused.md) when prose is the task.

## Carve MCP

When Carve MCP is available for the target version, use its versioned resources and `carve_lint` for a first check. Read [MCP routing](references/workflows.md#mcp-routing) for task-specific tools. Confirm that the server serves 0.2 before applying edits, since a 0.1 server teaches different syntax. When MCP is unavailable, use the pinned 0.2 engine described above.
