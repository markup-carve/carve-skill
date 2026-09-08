# Foundational Markdown / Djot traps

Heading ids, list markers, continuations, emphasis, ordered markers, and comments.
Sourced from the spec's `docs/divergence-from-djot.md`; the drift test keeps
this in sync.

This guide owns traps 1–6; cross-references to 7–13a open the block/container
guide, and 14–21 open the structure/reference guide.

## 1. Heading ids are case-preserving; cross-references resolve case-insensitively

`# Getting Started` → id `Getting-Started` (case kept, non-ASCII kept verbatim, no normalization). A `</#getting-started>` or `[Getting Started][]` reference still resolves — matching is case-insensitive and links to the target's actual (case-preserved) id. Only ASCII alphanumerics and non-ASCII code points survive in the id; every other ASCII run collapses to a single `-` (`# C++ & Rust` → `C-Rust`). Lowercase/ASCII-folded anchors are opt-in processor options, not the default.

## 2. A list marker must have content

A marker is a list item **only when followed by a space and non-empty content**. A lone `-`, `- `, or `-   ` is ordinary paragraph text (Markdown/Djot would make an empty list item). So a dash used as a prose separator does not become a bullet, and trailing whitespace is never load-bearing.

## 3. `+` is the continuation marker, not a bullet

Bullets are `-` and `*` only. `+` is reserved as the **continuation marker**: a lone `+` on its own line transfers the next flush-left block to the container whose marker column it sits at, without deep indentation. `+ text` is just paragraph text.

It is ONE block, and the same operation in every container that takes the marker - a list item, a block quote, a footnote body and a definition description. The attached block is written at COLUMN 0, not indented under the marker.

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
involved and 0.1.5 renders it the same way, so this is the rule rather than a
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
gone before the run exists, and the run carries the emptied line as a newline -
so the run STAYS OPEN across it. `@markup-carve/carve` 0.1.5 carries it, and so
does the build the spec pins. 0.1.3 hid the comment but closed the run at the
end of its line, which is why this entry claimed a different rendering until it
was re-measured.

````
::: |
a `b
%% secret
c
:::
````

````html
<div class="line-block">
  <p>a <code>b c</code></p>
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
`@markup-carve/carve` 0.1.5 renders `<p>a  b</p>` for `a {% hidden %} b`, and
carve-php 0.1.5 and carve-rs 0.1.3 each record the same behavior change in the
CHANGELOG of their released tag.

So **`{% … %}` is safe to write.** `%%` remains correct and is still the right
choice for a whole-line or end-of-line comment; the delimited form is for the
middle of a sentence, where `%%` would take the rest of the line with it.

**A table cell may carry a VERTICAL alignment too.** A cell
marker may carry a second axis, and the pair is HORIZONTAL FIRST
(markup-carve/carve#1405, #1407): `<^ <~ <v ~^ ~~ ~v >^ >~ >v` are runs, while
`v>` and a lone `^` or `v` stay ordinary cell content. `?` takes the column's
horizontal axis and its own vertical (#1408).

Re-measured 2026-08-28 on published `@markup-carve/carve` 0.1.5, where it WORKS:

    |=<^ A |   ->  <th style="text-align: left; vertical-align: top;">A</th>
    |?v x  |   ->  <td style="text-align: right; vertical-align: bottom;">x</td>

This paragraph used to say the opposite, and said it for a release after it
stopped being true: it recorded 0.1.4 leaving the markers as literal cell text
and told the reader to avoid the syntax. Nothing could catch that, because the
claim lived HERE, in prose, while the probes only read
`references/capabilities.json`. It is recorded there now as
`vertical_cell_alignment`, so the next release re-measures it instead of
trusting this sentence.

The collision worth knowing is unchanged: `^` alone in a DATA cell is the
rowspan marker (`| ^ |`), which is a different thing and works everywhere.

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
(markup-carve/carve#1311), and `@markup-carve/carve` 0.1.5 carries it: a
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
