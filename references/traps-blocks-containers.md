# Block and container traps

## Ownership and columns

0.2 uses the block chapter's content columns and line shapes. A child block belongs to its open list item, quote, description, footnote, or div only when the relevant prefix and column rules accept it. `+` does not pull a flush-left block into a container. Use a blank line and indent to the owner's content column, then render to verify. See [line shapes](../spec/spec/0.2/data/line-shapes.json) and [container ownership](../spec/spec/0.2/syntax-blocks.md#container-ownership-and-stripping).

## Fences

Backticks open code fences; tilde runs are ordinary text. Colon fences open divs, including named admonitions. A code fence language touches the marker, as in ` ```js `. A matching closer must meet the length and indentation rules. Raw `=html` content requires a host option; the default HTML renderer escapes it. See [fences](../spec/spec/0.2/syntax-blocks.md#fences-divs-and-comment-blocks).

## Breaks, headings, and attributes

`***` is a thematic break. `---` and `___` do not have the 0.1 break meaning. Put a blank line before a heading or attribute line after prose. An attribute line must be adjacent to the eligible block it modifies. A following blank line breaks that attachment.

## Tables

Use `|=` for header cells and a brace prefix for alignment, such as `|={>}`. A GFM separator line is a body row, not a header declaration. Preserve the table's column count and span marks. To make a CSV or TSV fence a table, give it the table attribute. See [table rules](../spec/spec/0.2/syntax-blocks.md#tables).

## Line-preserving content

`::: |` retains source lines as a line block; `::: \` is a hard-break block. They differ in how their bodies parse. Use the [sigil div clauses](../spec/spec/0.2/syntax-blocks.md#sigil-divs) when a line break affects meaning.
