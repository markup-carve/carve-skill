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

## Porting Djot → Carve (mechanical)

1. `_italic_` → `/italic/`; check every `*…*` (Djot strong stays `*…*`).
2. `~sub~` → `{,sub,}`, `^sup^` → `{^sup^}`; a `~…~` used for strikethrough is now native.
3. `+` bullets → `-` or `*`.
4. `{% comment %}` → `%%`.
5. A marker line directly under prose now starts a block — add a blank line or escape where you relied on Djot keeping it in the paragraph.
6. Definition lists: `: term` (+ indented body) → `:: term` then `:  definition`.

The bundled `markdownToCarve` helper and `carve lint --from-djot` flag most of these automatically.
