# Foundational traps

## Inline marks

Carve uses `/emphasis/` and `*strong*`. Markdown `**strong**` is not the native strong form. Underline, strike, and highlight require `{_text_}`, `{~text~}`, and `{=text=}`. Superscript and subscript require `{^text^}` and `{,text,}`. Bare punctuation can be literal even when the same symbol has a braced form. See [C2-I inline delimiters](../spec/spec/0.2/syntax-inline.md#emphasis-and-strong).

## Paragraph boundaries

A heading, quote, definition, or attribute-looking line directly under paragraph text can continue that paragraph. Add a blank line before the new block. A table row, code fence, or star thematic break has different interruption rules. Check [C2-B paragraphs](../spec/spec/0.2/syntax-blocks.md#paragraphs-and-interrupters) when editing inside an open container.

## Headings and ids

`= Heading` is the canonical simple heading form. Hash headings remain accepted. An explicit `{#id}` belongs on a line above the heading. Generated ids and references follow the 0.2 HTML and inline chapters; do not assume Markdown slug rules. Use `</#id>` only after checking the actual generated or explicit target.

## Lists and comments

A list marker needs content; `+` is text, not a bullet or a continuation. Indent a following block to the item's content column. `%%` starts a line comment; `%%%` opens a comment block and `{% ... %}` is an inline comment. A comment can affect line ownership, so inspect nearby boundaries after editing.

## Typography and symbols

Smart punctuation and named symbols are specified in [inline syntax](../spec/spec/0.2/syntax-inline.md) and [smart punctuation data](../spec/spec/0.2/data/smart-punctuation.json). Render a symbol example before promising a particular glyph. Escape a punctuation run when literal bytes matter.
