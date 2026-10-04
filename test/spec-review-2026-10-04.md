# Spec review, 2026-10-04

Reviewed `1acc54cf` through `e60b7847`, a commit on carve main, 19 commits of
lag. The open bump pull request targeted `3100de44`, which carve main had
already passed by nine commits, so the pin went to current main instead.

The drift guard named one AST schema node, one extension-contract section and
two grammar clauses. The divergence, cheatsheet, extension guide, validation,
security and rules ledgers had no changed entries.

The engine stayed at `@markup-carve/carve` 0.1.9, so every version-dated claim
in `references/` keeps the premise it was measured under.

## What moved

All four entries are one change: core pipe tables can now spell a table's row
grouping, which they could not before.

- `resources/grammar.ebnf`, clause A TABLE MAY CARRY AN OPTIONAL ROW GROUPING.
  Three new positional attributes, `body-rows`, `body-header-rows` and
  `body-header-cols` (PART 12 section 15). The clause previously said core
  pipe-table source "CANNOT spell multiple bodies, intermediate body headers,
  or per-group row-head counts" and that such partitions were interchange-only.
  That sentence is gone. `rowHeadColumns` is now defined as what HTML renders
  rather than what the cells assert, and a cell's own `header` flag is stated
  to stay independent. Explicit header rows are promoted "in HTML" rather than
  unconditionally.
- `resources/grammar.ebnf`, clause A `class` KEY-VALUE IS A SPELLING OF THE
  CLASS SLOT. The same three names were added to the list of key/value
  spellings that a block below may consume.
- `resources/ast-schema.json`, node `table`. The `rowGroups` description
  replaced "partitions without those source landmarks remain interchange-only"
  with the three pipe-table attributes preserving arbitrary body partitions.
- `docs/extension-contract.md`, section 5.2 Rendering. "Multiple body groups
  remain exchange-AST metadata" replaced by the same three attributes, and
  ListTable now described as keeping its own list node shape.

## Reference changes

None. The skill never taught the rule that moved.

`references/` mentions `rowGroups`, `header-rows`, `footer-rows` and
interchange-only partitions nowhere, so there was no old reading to correct.
The Tables section of `references/syntax.md` documents cell markers,
alignment axes, spans and the GFM separator alias; table attribute blocks are
outside what it covers, which is why `header-rows` and `footer-rows` are
absent from it too.

Worth noting rather than acting on: the three new attributes are authorable
pipe-table source, so they are in principle the skill's subject. Adding them
would mean opening a table-attribute topic the page does not have, which is a
scope decision rather than a correction, so this review records the gap
instead of filling it.
