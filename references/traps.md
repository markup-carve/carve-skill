# Markdown / Djot traps

Every place Carve deliberately breaks from Markdown/Djot. These are exactly what an agent gets wrong by defaulting to Markdown habits. Sourced from the spec's `docs/divergence-from-djot.md`; the drift test keeps this in sync.

## 1. Heading ids are case-preserving; cross-references resolve case-insensitively

`# Getting Started` → id `Getting-Started` (case kept, non-ASCII kept verbatim, no normalization). A `</#getting-started>` or `[Getting Started][]` reference still resolves — matching is case-insensitive and links to the target's actual (case-preserved) id. Only ASCII alphanumerics and non-ASCII code points survive in the id; every other ASCII run collapses to a single `-` (`# C++ & Rust` → `C-Rust`). Lowercase/ASCII-folded anchors are opt-in processor options, not the default.

## 2. A list marker must have content

A marker is a list item **only when followed by a space and non-empty content**. A lone `-`, `- `, or `-   ` is ordinary paragraph text (Markdown/Djot would make an empty list item). So a dash used as a prose separator does not become a bullet, and trailing whitespace is never load-bearing.

## 3. `+` is the continuation marker, not a bullet

Bullets are `-` and `*` only. `+` is reserved as the **list-continuation marker**: a lone `+` on its own line attaches the next flush-left block to the current list item (a note, quote, or code fence) without deep indentation. `+ text` is just paragraph text.

```
- step one
+
  > a note that belongs to step one
- step two
```

## 4. Visual-mnemonic emphasis (the delimiters are swapped)

| Effect | Markdown/Djot | Carve |
|--------|------|-------|
| Italic | `_text_` / `*text*` | `/text/` |
| Bold | `**text**` / `*text*` | `*text*` |
| Bold italic | `***text***` | `/*text*/` |
| Underline | (none) | `_text_` |
| Highlight | `==text==` / `{=text=}` | `=text=` |
| Strikethrough | `~~text~~` | `~text~` |
| Subscript | `~text~` | `{,text,}` (braced only) |
| Superscript | `^text^` | `{^text^}` (braced only) |

- **`**bold**` and `~~strike~~` are not Carve** — double delimiters leak literal characters.
- **`~text~` flips meaning:** subscript in Djot, **strikethrough** in Carve.
- **Sup/sub have no bare delimiter.** `^x^` and `,x,` are literal; only `{^x^}` / `{,x,}` mark. This is because the dominant uses are intraword (H₂O, mc²) and a bare comma collides with prose.
- Bare delimiters only fire at word boundaries; force an intraword one with the brace form (`H{,2,}O`).

## 5. No parenthesized ordered markers

Ordered lists use `.` and `)` only (`1.` / `1)`). `(1)`, `(a)`, `(i)` stay literal paragraph text (they are far more often a prose parenthetical).

## 6. Plain-text comments

`%%` to end of line, `text %% trailing`, or a `%%%` fenced block. Not `{% comment %}` and not `<!-- -->`.

## 7. Block openers interrupt paragraphs (Markdown-like)

A **visible** block marker directly under a line of prose starts a block with no blank line before it — `#` heading, `>` quote, `|` table row, or a fence. (Djot would keep it in the paragraph.)

```
intro
# Heading      →  <p>intro</p><h1>Heading</h1>
```

**Exception: list markers do NOT interrupt.** A bullet/ordered/task marker under prose stays in the paragraph; a list still needs a blank line before it (an ordered marker is common in prose — "see step 2."). Escape a marker (`\# H`, `\- item`) or add a blank line to control it.

## 8. Symbols `:name:` — stricter shape and boundary

`:name:` is a named placeholder, rendered literally unless the processor's `symbols` map maps it. Carve tightens Djot: the name must start with a letter, digit, `+`, or `-` (`:+1:` / `:-1:` parse, `:_x:` stays literal), and a symbol only opens at a word boundary (start of content or after a non-word char) — so `a:b:c` and `10:30:` stay literal. Attributes on a symbol (`:rocket:{.big}`) render a `<span>` wrapper.

## 9. Definition lists: explicit markers, one block per definition

```
:: term            (double colon = term; multiple terms allowed)
:: colour
:  definition      (single colon + two spaces = definition)
:  another sense
```

A **blank line ends the definition** — there is no multi-paragraph (loose) `<dd>`. Djot's `: term` + indented body parses as a plain paragraph in Carve, and vice versa. For rich block content in a definition, use a fenced div per entry instead.

## 10. Raw passthrough is target-routed

`` `x`{=format} `` inline and a ```` ```=format ```` block emit `x` verbatim, but only to the renderer whose target is `format`. Carve ships an HTML renderer that owns `html`, so `` `x`{=html} `` passes through in HTML output (and is escaped to text / dropped by the Markdown, ANSI, and plain renderers). Every other format (`{=latex}`, `{=typst}`, `{=markdown}`) is inert in Carve's own renderers: it survives in the AST as a `raw_inline` / `raw_block` node tagged with its format, for a custom consumer or pandoc (whose Djot reader routes it per writer), but no built-in renderer emits it. Do not expect `` `\alpha`{=latex} `` to render anything in Carve itself.

## 11. List continuation requires the content column

A block belongs to a list item only if it reaches the item's content column, the column where the item's own text starts (`- ` is 2, `1. ` is 3, `10. ` is 4). A block below that column detaches to document level (or lazily continues the paragraph); a block indented past it keeps its residual spaces and is paragraph text. The blank line before the block only decides tight vs loose, not attachment. This is the same rule Carve applies everywhere: a block opener fires only at column 0 of its context, so at the top level a leading-indented ` # h`, ` > q`, `` ` ``` ` ``, or ` :::` is literal paragraph text, not a block (Djot attaches at any indent). The `+` continuation marker (trap 3) still attaches a flush-left block regardless.

## 12. Smart typography always runs, and keeps your source

`--`, `...`, `->`, `"` and `'` are rewritten to typographic glyphs on every
render — there is no per-span opt-out and no "off in Markdown output" default.
The AST keeps the run you typed alongside the resolved glyph, so `carve fmt`
writes back `He said "hello"`, not the curly form, and `----` round-trips to
exactly four hyphens. Escape a single one with a backslash (`\"`); switch the
whole document off with the host option, which is meant for machine-facing
output — a corpus a model will read, or anything re-parsed downstream. It is
host API, not syntax, so each engine spells it its own way:

| | carve-js | carve-php | carve-rs |
|---|---|---|---|
| HTML | `carveToHtml(src, { smartTypography: false })` | `(new HtmlRenderer())->setSmartTypography(SmartTypographyMode::Source)` | `Options { smart_typography: SmartTypographyMode::Source, ..Options::default() }` |
| Markdown | `carveToMarkdown(src, { smartTypography: 'source' })` | `(new MarkdownRenderer())->setSmartTypography(...)` | the same `Options` field |

carve-php and carve-rs also take `--smart-typography source` on the command
line, and reject an unknown mode rather than ignoring it. The plain-text and
ANSI renderers still emit the glyph in all three (spec markup-carve/carve#560).
Heading ids are identical either way: the id pass normalizes the glyphs back to
ASCII before slugging.

## 13. Containers nest by width, and an unclosed one is text

An inner container must be **strictly wider** than the one holding it: `::::`
inside `:::`, not `:::` inside `:::`. Djot nests equal-length fences; Carve
reads the width as a depth count, so at equal length the inner opener is
neither a closer (a closer is bare, and `::: tip` carries a type word) nor an
opener — it stays paragraph text, and the first bare `:::` closes the outer
block. A bare closer closes **one** container, not every one open above it.

```
::: note        →  the `::: tip` line is TEXT inside the note,
::: tip            and the trailing `:::` is its own paragraph
Inner.
:::
:::
```

**An opener you never close renders nothing.** Djot closes it at end of file;
Carve leaves the opener line and its body as a paragraph, `:::` and all. A
mistyped closer therefore turns the tail of the document into text rather than
producing a slightly wrong container — the same call as an unclosed `%%%`
comment block, which degrades to line comments instead of swallowing the rest.
Widening the *inner* fence is broken in both languages: `::::` under an open
`:::` is a long bare closer, so it ends the outer container.

**Status: the spec has moved past this and no released engine has.** Spec
section 13 (markup-carve/carve#455) now closes a fence on an *exact* length
match, which makes equal-length fences nest, lets `:::` hold `::::`, and closes
an unclosed opener at end of input. Every rendering above is the behavior of
`@markup-carve/carve` 0.1.2 — the only published engine, and the one this skill
is tested against — measured, not assumed. Until 0.1.3 ships (markup-carve/carve#499)
write containers that parse the same under both rules: close every opener you
open, and nest by widening *outward*.

## 14. Headings are single-line

A heading ends at the newline. Nothing folds into it, so prose written directly
beneath one is its own paragraph and the heading's auto-id comes from the
heading line alone.

```
# Title        →  <h1 id="Title">Title</h1><p>Some text.</p>
Some text.

## A           →  two <h2> elements, ids A and B
## B
```

Djot folds both of those into the open heading (a plain line, or a line with the
same number of `#`, marker stripped), which silently took the id with it — the
`</#id>` cross-reference and the TOC anchor then pointed at a title nobody
wrote. Carve does not. This is the mirror of trap 7: prose-then-heading and
heading-then-prose now answer the same way.

What you lose is source-wrapping a long heading. Keep headings short; there is
no continuation form.

## 15. Block markers are column-strict, and the separator is a literal space

A top-level block opener must start at column 0, and a marker's separator is a
literal space that a tab does not satisfy.

```
 # H           ->  <p># H</p>          (leading space: prose, not a heading)
>	q           ->  <p>&gt;	q</p>       (tab after the marker: prose, not a quote)
```

Both are invisible in a diff and in most editors, so search for them rather than
reading for them. Trap 11 is the same rule seen from the list-item side.

## 16. Attribute identifiers are strict

A class or id may not start with a digit, and an attribute block that fails the
shape is not an attribute block - it stays literal text.

```
[x]{.123}      ->  <p>[x]{.123}</p>    (Djot: <span class="123">)
```

The failure is loud rather than silent: you see the braces in the output.

## 17. A list marker takes attributes

An attribute block right after the marker binds to the ITEM.

```
-{.c} x        ->  <ul><li class="c">x</li></ul>
```

Djot reads the same bytes as a paragraph with a span on the `-`. If you are
porting, the block structure changes, not just the styling.

## 18. An attribute line inside a paragraph is preserved, not consumed

```
intro
{.c}
# H            ->  <p>intro</p><h1 class="c">H</h1>
```

Djot consumes `{.c}` on the soft break and those bytes leave no trace. Carve
ends the paragraph at the block opener (trap 7) and applies the attributes to
the block below. This is the one porting case that silently CHANGES meaning
rather than becoming visible - the Djot output was well-formed and merely
missing something.

## 19. An attached sub-block leaves the item tight

A blank line inside an item attaches what follows; it does not loosen the item.

```
- a

  > q          ->  <li>a<blockquote><p>q</p></blockquote></li>   (lead stays bare)
```

Djot makes that item loose, wrapping the lead in `<p>`. Holds for an attached
quote, fence, div, heading and table. It does NOT hold for a nested list, which
is tight in both, and a plain paragraph after the blank is loose in both.

## 20. A typed container is a native admonition

```
::: note
body
:::            ->  <aside class="admonition note"><p>body</p></aside>
```

Djot renders `<div class="note">`. An unrecognized type still renders a div.
Only the element differs - same source, same tree shape - so this is a
rendering difference rather than a parsing one.

## Porting Djot → Carve (mechanical)

1. `_italic_` → `/italic/`; check every `*…*` (Djot strong stays `*…*`).
2. `~sub~` → `{,sub,}`, `^sup^` → `{^sup^}`; a `~…~` used for strikethrough is now native.
3. `+` bullets → `-` or `*`.
4. `{% comment %}` → `%%`.
5. A marker line directly under prose now starts a block — add a blank line or escape where you relied on Djot keeping it in the paragraph.
6. A wrapped heading (a plain or same-`#` line under `# Title`) no longer folds in — join it onto the heading line, or accept it as a paragraph.
7. Definition lists: `: term` (+ indented body) → `:: term` then `:  definition`.

The bundled `markdownToCarve` helper and `carve lint --from-djot` flag most of these automatically.
