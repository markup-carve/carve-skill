# Carve syntax reference

The whole core syntax. Everything here is **core** (Tier-1, on by default) unless it points to [extensions.md](extensions.md). Sourced from the spec's `docs/cheatsheet.md`; the drift test keeps the construct list in sync.

Mnemonic: **the markup looks like its output.**

## Inline

| Write | Result |
|-------|--------|
| `/italic/` | italic (slashes lean) |
| `*bold*` | bold (heavy) |
| `/*bold italic*/` | bold italic |
| `_underline_` | underline (line sits below) |
| `~strike~` | strikethrough (tilde runs through) |
| `{^super^}` | superscript (braced only) |
| `{,sub,}` | subscript (braced only) |
| `=highlight=` | highlight |
| `` `code` `` | inline code |
| `[text](url)` | link |
| `[Page Name][]` | wiki-style link → resolves to a heading |
| `<https://url>` | autolink |
| `</#section-id>` | cross-reference (link text cloned from the target) |
| `![alt](img.jpg)` | image |
| `[^1]` / `^[inline note]` | footnote (reference / inline) |
| `[span]{.class}` | span with attributes |
| `@user` `#tag` | mention / tag |
| `\*literal\*` | escape (backslash + any ASCII punctuation) |
| `--` `---` `...` `-->` `==>` `(c)` | – — … → ⇒ © (smart typography; `->` deprecated) |
| `` `<br>`{=html} `` | raw inline (only for the matching output format) |
| `\` at end of line | hard break |

Bare delimiters fire only at word boundaries; force one intraword with the brace form: `H{,2,}O`, `mc{^2^}`.
`[t]()` is a link with `href=""`. See [structure traps](traps-structure-references.md#empty-destinations-graphemes-and-atomic-spans) for empty destinations, whole-grapheme delimiters and atomic autolinks.

## Headings

ATX `#`..`######`. Attributes go on the line **above**:

```
{#intro .featured}
# Introduction
```

## Thematic break

`---`, `***`, or `___` on their own line.

## Lists

```
- unordered        * also unordered      1. ordered      1) ordered
- [ ] task         - [x] done            a. A. i. I. dialects
                   (i. then j. is alphabetic, from 9)
                   (more task states: [-] [_] [>] [?])
-{.c} styled item  (attributes abutting the marker target the <li>)

. auto-numbered    (the preferred native form: a bare dot counts from 1 and
. and again         keeps nested indentation stable at 10, 100, ... because
. and again         the marker never widens. The `1.` form is the one that
                    ports to Markdown and Djot.)
```

`+` alone at column 0 continues an item (attaches the next column-0 block; an indented `+` is text):

```
- step one
+
> a note for step one
- step two
```

Definition list:

```
:: term
:: another term
: definition       (one space after `:`)
: another definition
```

## Blockquotes

```
> quoted text
^ Attribution           (^ prefix = caption/attribution)

> quoted
+                       (+ at column 0 attaches the next flush-left block to the quote)
- a list now inside the quote
```

A colon fence whose separator is followed by `>` builds the same quote with
no marker on any line - the third member of the sigil family beside the line
block's `|` and the local hard-break block's backslash:

```
::: >
A quote written as a fence.

It needs no marker per line, and holds any block.
:::
```

## Code fences

Canonical is ` ```language ` — **no space** after the backticks.

````
```python "src/app.py" [pip]
code
```
````

`"Header"` → `<pre title>`; `[Label]` → code-group tab name. Both optional, space-separated, in that order. Raw pass-through (emitted only when the output format matches):

````
```=html
<div>passed through</div>
```
````

`{.scroll}` above a fence or `@code` include scrolls it at 25 lines. It is a carve-css recipe, not syntax; `style="--carve-scroll-lines: 20"` sets the height.

## Divs and admonitions

```
::: note "Custom Title"
body
:::
```

Types: `note tip warning danger info success example quote`. Any other word → `<div class="word">`, except `footnotes toc glossary index bibliography references`, which **place** generated content and fall back to that `<div>` (see [extensions.md](extensions.md)). Title must be **straight-quoted**; unquoted or curly-quoted is invalid (`fence-title-syntax`). The bad title is dropped and the container kept (0.1.9 dropped the whole line to a paragraph). Longer fences nest shorter ones:

```
:::: outer
::: note
inner
:::
::::
```

`::: |` keeps every line break and leading space, and lists inside are text;
`::: \` keeps only the line breaks, and lists work.

## Tables

```
|= Header |= Header |        (|= = header cell, also for row headers in body rows)
| Cell    | Cell    |
^ Table caption

|= Name |=> Age |=~ City |   (alignment glued to |=: < ~ >)
| Sum    |< 12   | NYC    |   (a data-cell marker overrides per cell)
|=<^ Top |=>v Low |          (vertical second axis, horizontal first;
|?v x |                       ? keeps the column's horizontal)

| Name  | Age |              (GFM separator row, a second header spelling)
|-------|----:|
| Alice |  30 |

|= Item |= Qty |= Note |
| Apple | 12 | fresh |
+       |    | picked today |  (+ = continuation)
| ^     |  3 | <     |          (^ = rowspan, < = colspan)
```

Span and alignment rules: [table cells](traps-structure-references.md#table-cells).

````
{table}                      (csv or tsv fence -> table; without it, code)
```csv
Name,Score
"Lee, A",3
```
````

`{table}` also goes above a data file included as code:

```
{table}
{{ data/plans.csv @code:csv }}
```

Rules: [delimited tables](traps-structure-references.md#delimited-tables).

## Captions

A `^ Caption` line after an image, table, fenced code block, or `$$`-math block adds a semantic `<figcaption>` (a listing / equation when after code / math). `^ Figure #:` auto-numbers; `</#id>` to a captioned block renders the number.

```
{#fig-sun}
![A sunset](sun.jpg)
^ Figure #: A sunset
```

Captions fold following lines like a paragraph until a blank line.

## Math, comments, editorial

```
Inline $`e^{i\pi}+1=0`        Display $$`\int_0^1 x\,dx`

%% line comment
text %% trailing comment
before {% delimited %} after      (spec 21a; live in every released engine)
%%%
block comment                     (hides its body at any column, including a
%%%                                definition inside it - trap 6)

{+inserted+}  {-deleted-}  {~old~>new~}  {#a comment#}   (CriticMarkup)
```

## Attributes & metadata

```
{#id .class key=value}        (attach to the preceding/following element; bare word = boolean attr)

*[HTML]: HyperText Markup Language   (abbreviation definition)

---
title: My Document            (frontmatter; ---toml / ---json for other formats)
tags: [carve, markup]
---

{{ chapter.crv#intro @shift:auto }}  (processor include)
{{ app.js @region:setup @code:js }}  (region of a source file, as one code block)
{{ ch.crv @region:setup }}           (region of a Carve file, marked %% #region setup)
```

Core never expands an include and the braces stay, but the bytes inside still
parse as inline content, so only a directive carrying no inline marker comes back
verbatim: the `@shift` above renders as a mention.

Files are `.crv`, media type `text/x-carve; charset=utf-8`.
