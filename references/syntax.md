# Carve 0.2 syntax

This card summarizes the `next2` [block](../spec/spec/0.2/syntax-blocks.md) and [inline](../spec/spec/0.2/syntax-inline.md) chapters. The chapters decide edge cases. The 0.2 [cheat sheet](../spec/docs/cheatsheet.md) is the short upstream card.

## Inline

| Meaning | Source |
| --- | --- |
| Emphasis | `/word/` or `{/word/}` |
| Strong | `*word*` or `{*word*}` |
| Underline | `{_word_}` |
| Strike | `{~word~}` |
| Highlight | `{=word=}` |
| Superscript, subscript | `{^2^}`, `{,2,}` |
| Code, math | `` `code` ``, `` $`x + y` `` |
| Link, image | `[label](https://example.com)`, `![alt](image.png)` |
| Reference, cross-reference | `[label][]`, `</#heading-id>` |
| Footnote | `[^note]`, `^[inline note]` |
| Attribute span | `[text]{.class}` |
| Raw HTML | `` `<b>x</b>`{=html} ``; host must enable it |

Bare `_`, `~`, and `=` are literal. Braces also supply unambiguous emphasis and strong inside words. Escape ASCII punctuation with a backslash when it should be text. A code span preserves its contents. See the [inline chapter](../spec/spec/0.2/syntax-inline.md) for pairing, references, symbols, citations, and typography.

## Blocks

```crv
= Heading

A paragraph with /emphasis/ and *strong text*.

> A quote.

- First item
- Second item

1. First step
2. Second step

***
```

A heading may also use `#` through `######`. Most block openers need a blank line after paragraph text. Table rows, code fences, and star breaks can interrupt. An attribute line attaches to the next eligible block when no blank line separates them.

## Lists and descriptions

```crv
- Parent
  - Child
- Sibling

:: Term
: Definition
```

A list item needs text or a block on the marker line. Indent later blocks to the item's content column. A `::` term continues only on lines indented past its mark. A blank line between items makes the list loose. Ordered markers include decimal, alphabetic, and Roman styles; use the [block chapter](../spec/spec/0.2/syntax-blocks.md) for start and style rules. `+` has no attachment role.

## Fences and divs

````crv
```js
const answer = 42
```

::: note "Remember"
An admonition.
:::
````

Backtick fences make code. A language follows the opener without a space. Colon fences make divs; `::: |` and `::: \` are line-preserving forms. A raw HTML fence uses ` ```=html ` and renders raw only when allowed by the host. Comment blocks use `%%%`.

## Tables and captions

```crv
|= Name |={>} Qty |
| Apples | 3 |
^ Inventory
```

`|=` marks a header cell; the brace prefix holds alignment. A GFM separator row is data in 0.2. Captions follow an eligible table, image, code, or math block. A caption continues only on lines indented past its `^`; an unindented line starts the next block. See the [table rules](../spec/spec/0.2/syntax-blocks.md#tables) for spans, attributes, and delimited CSV or TSV tables.

## Attributes, definitions, includes

```crv
{.lead}
An introduction.

[guide]: https://example.com/guide

Read [guide][].
```

Attribute lines attach forward without an intervening blank line. Reference definitions require their own block boundary. A link definition may put its title or attribute block on one line indented below it, and an abbreviation expansion continues on indented lines. An include looks like `{{ chapter.crv #intro }}` and expands only when the host enables a resolver and root. See [includes](../spec/spec/0.2/includes.md).

## Frontmatter and metadata blocks

````crv
---
title: Book
---

= Chapter 1

{#ch1}
---yaml
author: Ada
---

Text.
````

Line 1 may open frontmatter with a bare `---`. After line 1, `---` glued to a format word (`yaml`, `toml`, `json`) opens a metadata block only at column 0 at the top level, after a blank line or an attribute line; a bare `---`, an indented opener and one inside a container stay text. The payload is opaque and renders nothing. `{#id}` above it is a lookup key, not a link target. Attribute lines that start on line 1 and sit directly above a typed opener make it the document frontmatter. A missing closer runs to the end of the document and reports `unclosed-frontmatter`. Only the line-1 block declares `carve-version`. See [frontmatter](../spec/spec/0.2/syntax-blocks.md#frontmatter) (C2-B-232, C2-B-233) and the [metadata blocks page](../spec/docs/metadata-blocks.md).

## Changed in 0.2

`+` continuation, bare underline/strike/highlight, hyphen or underscore thematic breaks, tilde code fences, and GFM separator headers no longer have their 0.1 meanings. Captions and terms no longer take unindented lines. For source migration, read [migration](traps-migration.md).

## Rendered example

```crv
A paragraph with /emphasis/.
```
```html
<p>A paragraph with <em>emphasis</em>.</p>
```
