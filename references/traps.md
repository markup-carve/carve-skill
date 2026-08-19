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

`%%` to end of line, `text %% trailing`, or a `%%%` fenced block. Not `<!-- -->`.

`%%` runs to the end of its inline **run**, so prose cannot resume after it on the
same line. Structure supplies a boundary where there is one — a table cell ends at
`|`, link text at `]` — but plain prose supplies none.

**There are two comment constructs, not one, and which you wrote decides every
hard case.** A line whose first character is `%` is `comment_line`, a **block**:
it is settled at the block layer, before any inline content exists. A `%%` after
content on the same line is `inline_comment`, an **inline** construct (spec
section 21). The two rules below are that split, not exceptions to it.

**An inline comment does not survive an unclosed verbatim run.** PART 3's
UNCLOSED RUN clause turns every inline construct after an unclosed opener into
content, and an inline comment is not exempt, so its text is *published* rather
than hidden:

````
a `b %% secret
````

````html
<p>a <code>b %% secret</code></p>
````

Those are two percent signs inside a code span, not a comment. No container is
involved and 0.1.3 renders it the same way, so this is the rule rather than a
version note. The author who hits it is writing a private aside next to a code
span whose backtick they never closed. A comment on its own line is settled
before any run exists and cannot be reached this way, which is the whole of the
difference.

**Inside a `::: |` line block a comment must start at column 0.** Leading
whitespace is content in verse, so `comment_line`'s optional whitespace prefix
has nothing to consume there: only a body line whose FIRST character is `%` is a
comment line. An indented `%%` is ordinary verse text and its leading run
renders as NBSPs like any other.

````
::: |
%% hidden
  %% shown
b
:::
````

````html
<div class="line-block">
  <p><br>
&nbsp;&nbsp;%% shown<br>
b</p>
</div>
````

This is not trap 15's column strictness reaching one construct further; it is
the opposite. Verse has no indentation to skip, because a leading run is content
the block preserves. The writer side says the same thing from the other end: the
comment stays a node and `carve fmt` writes it back at the same column, so a
writer that indented it by one space to stop it re-reading as a comment would
publish the very text the comment exists to hide.

**A comment on its OWN LINE is hidden even under an unclosed run.** The two
rules above meet in one document, and the spec settles it at the block layer
(markup-carve/carve#1333, shipped as markup-carve/carve#1339): the comment is
gone before the run exists, and the run carries the emptied line as a newline.
`@markup-carve/carve` 0.1.3 carries it.

````
::: |
a `b
%% secret
c
:::
````

````html
<div class="line-block">
  <p>a <code>b</code><br>
<br>
c</p>
</div>
````

The private aside stays private. Only an INLINE comment, one that follows
content on the same line, is published by an unclosed run - which is the rule
two paragraphs up, and the whole of the difference between the two constructs.

**Status: shipped, in every released engine.** Spec section 21a
(markup-carve/carve#1239) takes Djot's `{% … %}` unchanged, so `foo {% bar %} baz`
renders `<p>foo  baz</p>`. This entry previously said no released engine had it,
measured against `@markup-carve/carve` 0.1.3; the 2026-08-18 round shipped it in
all three. Re-measured against the PUBLISHED packages on that date:
`@markup-carve/carve` 0.1.4 renders `<p>a  b</p>` for `a {% hidden %} b`, and
carve-php 0.1.5 and carve-rs 0.1.3 each record the same behavior change in the
CHANGELOG of their released tag.

So **`{% … %}` is safe to write.** `%%` remains correct and is still the right
choice for a whole-line or end-of-line comment; the delimited form is for the
middle of a sentence, where `%%` would take the rest of the line with it.

**A table cell's VERTICAL alignment is implemented but unreleased.** A cell
marker may carry a second axis, and the pair is HORIZONTAL FIRST
(markup-carve/carve#1405, #1407): `<^ <~ <v ~^ ~~ ~v >^ >~ >v` are runs, while
`v>` and a lone `^` or `v` stay ordinary cell content. `?` takes the column's
horizontal axis and its own vertical (#1408).

Measured 2026-08-19 on carve-js `main` (1a4c82e), where it WORKS:

    |=<^ A |   ->  <th style="text-align: left; vertical-align: top;">A</th>
    |?v x  |   ->  <td style="text-align: right; vertical-align: bottom;">x</td>

and on published `@markup-carve/carve` 0.1.4, where it does NOT: the same
`|=<^ A |` renders `text-align: left` with the caret surviving as the text
`^ A`. carve-php 0.1.5 and carve-rs 0.1.3 record nothing for it either.

So write it only when you know the consumer runs a build past 0.1.4, and read a
stray `^` in a cell as output rather than markup until then. The collision worth
knowing: `^` alone in a DATA cell is the rowspan marker (`| ^ |`), which is
unaffected and works everywhere today.

The rules: `{%` opens and the **first** `%}` closes, there is no nesting, a
comment inside an emphasis run does not break it (`*bo{% c %}ld*` is one
`<strong>`), the run may cross soft line breaks inside one paragraph but never a
blank line, an unterminated `a {% oops` stays literal, code spans and raw inlines
pass `{%` through, and `\{%` is literal text. Both spellings drop out of every
render target and both parse to a `comment` node that records which one produced
it, so `carve fmt` cannot collapse a delimited comment into a trailing `%%` and
swallow the rest of the line.

One consequence to know before you author: under that rule a Liquid or Nunjucks
page whose `{% raw %}` reaches the parser as text has its tags read as comments.
`carve lint` reports that shape rather than rewriting it.

**A `%%%` fence hides its body wherever the fence sits**, not only at column 0.
PART 9 section 24 S1 places a line by the column it reaches rather than by its
first character, S2 makes a line verbatim as soon as the innermost matched
container is a fenced body, and section 28 makes a comment fence's body verbatim
and invisible. None of the three is scoped to column 0, so a definition inside an
indented comment fence registers nothing and a reference to it stays literal.
This is not an exception to traps 11 and 15 - the fence still has to reach its
container's content column to be a fence at all.

The rule is pinned by corpus documents `335` to `341`
(markup-carve/carve#1311), and `@markup-carve/carve` 0.1.3 carries it: a
definition inside a comment fence is not collected, so a reference to it stays
literal.

````
- item
  %%%
  [r]: /url
  %%%

[r][]
````

````html
<ul>
  <li>item</li>
</ul>
<p>[r][]</p>
````

Same shape for a fence opened on the `- ` marker line, one item deeper, a wider
`%%%%` fence, and one inside a `::: note`; the abbreviation form is hidden the
same way, and so is a footnote definition. Ports can lag the JS engine on this
one - markup-carve/carve-php#1349 tracks it there - so if you render with
another implementation, check before relying on a commented-out definition
staying unresolved.


## 7. Block openers interrupt paragraphs (Markdown-like)

A **visible** block marker directly under a line of prose starts a block with no blank line before it — `#` heading, `>` quote, `|` table row, or a fence. (Djot would keep it in the paragraph.)

```
intro
# Heading      →  <p>intro</p><h1>Heading</h1>
```

**Exception: list markers do NOT interrupt.** A bullet/ordered/task marker under prose stays in the paragraph; a list still needs a blank line before it (an ordered marker is common in prose — "see step 2."). Escape a marker (`\# H`, `\- item`) or add a blank line to control it. Fence and `:::` **closers** and bare images are excluded too, for the same reason: only an opener that starts something visible interrupts.

An attribute line between the prose and the block is the one place the two differ by more than block position - see trap 18.

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

## 13. Containers nest, and an unclosed one closes at the end

**Nest by widening outward, and close every opener you open.** A container that
holds another can always be strictly wider than the one it holds: `::: tip`
inside `:::: note`. That shape reads the same under every rule the language has
had, and ports that lag still get it right, which is why it is the one to write.

```
:::: note       →  a tip nested inside a note
::: tip
Inner.
:::
::::
```

**Equal length nests too, and an opener you never close is closed for you.**
Spec section 13 (markup-carve/carve#455) closes a fence on an *exact* length
match rather than reading the width as a depth count, so a `:::` container holds
a `::: tip`, holds a `:::: tip`, and an opener with no closer ends at end of
input instead of degrading to paragraph text. A bare closer still closes **one**
container, not every one open above it.

Measured against `@markup-carve/carve` 0.1.3, the engine this skill is tested
against:

```
::: note        →  a tip nested inside a note
::: tip
Inner.
:::
:::
```

```
::: note        →  the note holds the body and closes
Body.              at the end of the document
```

This is a widening, not a reversal: every shape the first paragraph recommends
parses the same either way. It is the two shapes that used to fail - an
equal-length inner opener left as text, and an unclosed opener left as a
paragraph - that stopped failing.

**The code fence next door does not follow.** Both say widen outward, so the
habit carries; the reason does not. A code fence's length is a quoting relation
rather than a depth count, so an equal-length inner fence *closes* the wrapper
there and always will. See trap 13a.

## 13a. A code fence must be longer than every fence line it holds

The wrapper is the OUTER fence, and it has to be **strictly longer** than any
fence line inside it: content holding a three-backtick line needs a
four-backtick wrapper. This is the one rule here that Markdown and Djot already
share. It earns a trap anyway because trap 13 is its neighbor and is about to
stop agreeing with it, and because the place it actually goes wrong is not the
`.crv` file - it is Carve written into a GitHub issue, a PR body, a docs page
or a chat answer, where nobody renders the result before posting it. Carve
documentation is usually *about* fences, so its examples contain literal fence
lines.

A code fence closes on the first **bare** fence of the same character that is
*at least as long* as the opener (`code_fence_close`: `len(close) >=
len(open)`). It never nests - the body is opaque, so there is no depth to count
and the length is a quoting relation instead. Equal length therefore closes.

Broken. The inner fence closes the wrapper on the second line, so the sample
that was meant to be shown is rendered instead:

````
```
```
- item
```
renders as a list
```
````

renders

````html
<pre><code>
</code></pre>
<ul>
  <li>item</li>
</ul>
<pre><code>renders as a list
</code></pre>
````

One more backtick, on the wrapper only, is the fix:

`````
````
```
- item
```
renders as a list
````
`````

renders

````html
<pre><code>```
- item
```
renders as a list
</code></pre>
````

A language tag changes nothing - a ` ```html ` wrapper holding a bare
three-backtick line breaks the same way. Only a *bare* fence closes, so an
inner opener carrying an info string (` ```js `) is content even at the
wrapper's own length; the bare closer that ends that inner block is not, so a
complete inner block still needs the wider wrapper. A fence of the *other*
character never closes at all - a `~~~` wrapper holds backtick fences of any
length - but width is the rule to write by, because it is the one that holds
when the content you are quoting turns out to contain both.

Two things that look like fixes and are not:

- **Widening the inner fence.** ` ``` ` holding ` ```` ` ends on the longer
  line and leaves a stray inline code span in the tail. Widen outward, never
  inward.
- **Indenting the inner fence.** A delimiter indented past its opener is
  content rather than a closer, so the block does survive - but the leading
  spaces are preserved verbatim, and columns are the one thing a markup example
  exists to show.

Some breakage is not a width problem at all: an example missing its own closing
fence, or an info string that itself contains backticks (```` ```js `x` ````,
which opens no fence and degrades to an inline code span), needs a line fixed
rather than a wider wrapper. That is also why the two obvious detection
signatures - a fence line followed by one of the same or shorter length, and an
odd total fence count - over-flag by about a third: an odd count is legitimate
when a lone three-backtick line sits inside a four-backtick wrapper, and
same-length neighbors are harmless when the inner one carries an info string.
Parse the document and require a real defect instead.

Unlike trap 13, this rule never moved, and that is the whole of the difference
between them. Both say widen outward; markup-carve/carve#455 moved the
*container* closer to an exact-length match and deliberately left code fences on
`>=`, "because their length axis really is quoting: opaque content that never
nests, which must be able to hold a shorter fence". That has shipped, so an
equal-length container nests and an equal-length code fence still closes early.
The spec and `@markup-carve/carve` 0.1.3 agree here, measured.

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

## 21. Footnote labels are matched exactly

The label runs to the closing `]` and is compared byte for byte. Whitespace is
not collapsed, the ends are not trimmed, and a reference may not contain a
newline at all. Only a reference written the way the definition was written
binds.

Given the definition `[^a b]: foo`:

```
[^a b]         ->  binds
[^a  b]        ->  literal text        (two spaces; Djot binds)
[^a	b]        ->  literal text        (a tab; Djot binds)
[^ a b ]       ->  literal text        (padded ends; Djot binds)
```

A reference cannot be wrapped, so a long label has to stay on one line:

```
see[^two
words].

[^two words]: foo
```

renders

```html
<p>see[^two
words].</p>
```

Djot normalizes the label before lookup, so all four spellings above are one
footnote there. Released djot.js agrees with Carve on the wrapped case today,
but that half is on its way to becoming a divergence too - so treat one-line,
byte-identical labels as the rule rather than a style preference.

Same ruling as link-reference labels: the bytes decide, and nothing is silently
dropped - an unmatched reference stays visible as the text you typed, which is
how you spot it. `carve portability` reports a document that relies on the Djot
behavior.

## Porting Djot → Carve (mechanical)

1. `_italic_` → `/italic/`; check every `*…*` (Djot strong stays `*…*`).
2. `~sub~` → `{,sub,}`, `^sup^` → `{^sup^}`; a `~…~` used for strikethrough is now native.
3. `+` bullets → `-` or `*`.
4. `{% comment %}` needs no change - section 21a keeps the Djot spelling working and every released engine implements it (trap 6). Convert to `%%` only where the comment already occupies its own line.
5. A marker line directly under prose now starts a block — add a blank line or escape where you relied on Djot keeping it in the paragraph.
6. A wrapped heading (a plain or same-`#` line under `# Title`) no longer folds in — join it onto the heading line, or accept it as a paragraph.
7. Definition lists: `: term` (+ indented body) → `:: term` then `:  definition`.

The bundled `markdownToCarve` helper and `carve lint --from-djot` flag most of these automatically.
