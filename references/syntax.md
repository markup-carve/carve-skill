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
| `--` `---` `...` `->` `(c)` | – — … → © (smart typography) |
| `` `<br>`{=html} `` | raw inline (only for the matching output format) |
| `\` at end of line | hard break |

Bare delimiters fire only at word boundaries; force one intraword with the brace form: `H{,2,}O`, `mc{^2^}`.

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
                   (more task states: [-] [_] [>] [?])
-{.c} styled item  (attributes abutting the marker target the <li>)

. auto-numbered    (the preferred native form: a bare dot counts from 1 and
. and again         keeps nested indentation stable at 10, 100, ... because
. and again         the marker never widens. The `1.` form is the one that
                    ports to Markdown and Djot.)
```

`+` on its own line continues an item (attaches the next flush-left block, no deep indent):

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
:  definition
:  another definition
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

## Divs and admonitions

```
::: note "Custom Title"
body
:::
```

Types: `note tip warning danger info success example quote`. Any other word → `<div class="word">`. Title must be **straight-quoted** (unquoted or curly-quoted makes the line a plain paragraph). Longer fences nest shorter ones:

```
:::: outer
::: note
inner
:::
::::
```

`::: |` preserves per-line layout; `::: \` gives local hard breaks.

## Tables

```
|= Header |= Header |        (|= = header cell, also for row headers in body rows)
| Cell    | Cell    |
^ Table caption

|= Name |=> Age |=~ City |   (alignment glued to |=: < ~ >)
| Sum    |< 12   | NYC    |   (a data-cell marker overrides per cell)
|=<^ Top |=>v Low |          (a VERTICAL second axis, HORIZONTAL FIRST:
|?v x |                       <^ <~ <v ~^ ~~ ~v >^ >~ >v. `v>` and a lone
                              ^ or v are ordinary cell content. `?` inherits
                              the column's horizontal axis. Shipped in
                              published 0.1.5.)

| Name  | Age |              (GFM separator row accepted as an alias)
|-------|----:|
| Alice |  30 |

| ^      | spanned |         (^ = rowspan)
| Header | <       |         (< = colspan)
+ continuation cell |        (+ = multi-line cell)
```

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
```
