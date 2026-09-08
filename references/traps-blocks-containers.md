# Block and container traps

Paragraph interruption, symbols, definitions, raw output, continuation columns,
smart typography, containers, and fence sizing.

This guide owns traps 7–13a; cross-references to 1–6 open the foundation guide,
and 14–21 open the structure/reference guide. It is sourced from the spec's
`docs/divergence-from-djot.md` and drift-checked against that source.

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
: definition       (single colon + a space run = definition)
: another sense
```

The separator is a run of ONE OR MORE spaces, and its width sets the body's content column (`: x` establishes column 2, `:  x` column 3). **One space is canonical** - a wider separator parses and means the same thing, and `carve fmt` narrows it, carrying every continuation line inside that body down by the same amount.

A **blank line ends the definition** — there is no multi-paragraph (loose) `<dd>`. Djot's `: term` + indented body parses as a plain paragraph in Carve, and vice versa. For rich block content in a definition, use a fenced div per entry instead.

## 10. Raw passthrough is target-routed

`` `x`{=format} `` inline and a ```` ```=format ```` block emit `x` verbatim, but only to the renderer whose target is `format`. Carve ships an HTML renderer that owns `html`, so `` `x`{=html} `` passes through in HTML output (and is escaped to text / dropped by the Markdown, ANSI, and plain renderers). Every other format (`{=latex}`, `{=typst}`, `{=markdown}`) is inert in Carve's own renderers: it survives in the AST as a `raw_inline` / `raw_block` node tagged with its format, for a custom consumer or pandoc (whose Djot reader routes it per writer), but no built-in renderer emits it. Do not expect `` `\alpha`{=latex} `` to render anything in Carve itself.

## 11. List continuation has Carve's minimum content column

A block belongs to a list item only if it reaches the item's content column, the column the BARE marker and its separator end at (`- ` is 2, `1. ` is 3, `10. ` is 4). Bare is the operative word: a marker-attached attribute block and a task checkbox are both worth zero columns, so `-{.averylongclass} x` and `- [x] x` keep the column at 2 even though their text starts further right (see trap 17). A block below that column detaches to document level (or lazily continues the paragraph). A block indented PAST the column still nests: like Djot, Carve accepts a recognized opener at any deeper indent and treats its authored column as that block's temporary base. The column is a MINIMUM, not an exact match. The blank line before the block only decides tight vs loose, not attachment. TOP-LEVEL OPENERS STAY COLUMN-STRICT, which is the part that is not a minimum: at the top level a leading-indented ` # h`, ` > q`, `` ` ``` ` ``, or ` :::` is literal paragraph text, not a block. The `+` continuation marker (trap 3) still attaches a flush-left block regardless.

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

**The arrow family CHANGED in 0.1.5, and one spelling this file used to
recommend stopped working.** markup-carve/carve#1442 made the doubled run
canonical (`-->` `<--` `<-->`, `==>` `<==` `<=>`), deprecates `->` `<-` `<->`
without removing them, removes `=>` because `key => value` is prose about code,
and pairs a guard that keeps a bare hyphen run literal in the flag position
(`x --next`) with `{--}` as the braced en dash that still converts there.

Re-measured 2026-08-28 on published `@markup-carve/carve` 0.1.5, which now
behaves the way only the pinned build used to:

| source | published 0.1.4 | published 0.1.5 |
| --- | --- | --- |
| `a --> b` | en dash then a literal `>` | → |
| `a ==> b` | `=` then ⇒ | ⇒ |
| `a => b` | ⇒ | **literal `=>`** |
| `a <=> b` | ≤ then `>` | ⇔ |
| `{--}` | empty CriticMarkup delete | – |
| `x --next` | en dash | `--next`, left alone |

**So do NOT write `=>`.** It converted in 0.1.4, this file recommended it on that
basis, and 0.1.5 removed it because `key => value` is prose about code. It is
literal text now. The single-dash family is deprecated but still converts, so
the spellings that are safe in both releases are `->`, `<-` and `<->`; add
`==>`, `<==` and `<=>` when the consumer is on 0.1.5 or later.

One shape to know: `<==>` is NOT a spelling. It renders `⇐` followed by a
literal `>`, because `<==` matches first.

Recorded as `doubled_arrows` in `references/capabilities.json` so a probe checks
it, rather than this table being re-read by hand every release.

**Do not identify the build by its version field.** A published release and a
git install of carve-js `main` can BOTH report the same string in `package.json`,
because
that field only moves at a release cut - so "confirmed via package.json" cannot
tell them apart, and the spec repository pins a git SHA rather than the npm
package. The exported `SMART_PUNCTUATION_GLYPHS` map does tell them apart: the
release has four arrow glyphs, the pinned build has six, and the two missing
from the release are `leftwards_double_arrow` and `left_right_double_arrow`.

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

Measured against `@markup-carve/carve` 0.1.5, the engine this skill is tested
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
The spec and `@markup-carve/carve` 0.1.5 agree here, re-measured 2026-08-28.
