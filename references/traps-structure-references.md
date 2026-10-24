# Structure and reference traps

Headings, attributes, tight-list attachment, admonitions, footnote labels, and table cells.

This guide owns traps 14–21; cross-references to 1–6 open the foundation guide,
and 7–13a open the block/container guide. It is sourced from the spec's
`docs/divergence-from-djot.md` and drift-checked against that source.

## 14. Headings are single-line

A heading ends at the newline. Nothing folds into it, so prose written directly
beneath one is its own paragraph and the heading's auto-id comes from the
heading line alone.

```
# Title        →  <section id="Title"><h1>Title</h1><p>Some text.</p></section>
Some text.

## A           →  two <h2> elements, ids A and B
## B
```

The id sits on the `<section>` wrapper, not on the `<h1>` (trap 1c).

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

## 16. Attribute names are strict, but class and id values are not

An explicit class or id may start with a digit - HTML permits those values, so
Carve preserves them. What stays strict is every NAME: an attribute key, a
boolean name and an inline-extension name each have to begin with an ASCII
letter or underscore, and a block that fails the shape is not an attribute
block at all - it stays literal text.

```
[x]{.123}      ->  <p><span class="123">x</span></p>   (accepted)
[x]{12=v}      ->  <p>[x]{12=v}</p>                    (a digit-leading KEY)
```

The failure is loud rather than silent: you see the braces in the output.
GENERATED heading ids stay conservative either way - a digit-leading slug still
takes the `s-` prefix.

`class=VALUE` also writes the class slot, in source order with `.class`
tokens in the spec (`CARVE-P4-007`). 0.1.10 merges the two into one HTML class
attribute in source order (`[x]{.a class=b}` renders `class="a b"`); 0.1.7
emitted two, so keep one spelling per element when the consumer may be older.
For a class the dotted form cannot spell, `[x]{class=w-1/2}` renders a span
with class `w-1/2`. Quote a value
containing whitespace, braces, quotes, a backslash or a pipe; inside a table
cell, write a literal pipe as `\|` even in a quoted attribute value.

Separate attributes with spaces only (`CARVE-P4-001`). In the spec a tab inside
an attribute block is content, so `{.a<TAB>.b}` on its own line is paragraph
text. The 0.1.11 engine leaves it as paragraph text.

## 17. A list marker takes attributes

An attribute block right after the marker binds to the ITEM. It is item metadata, not marker width, so it contributes nothing to the item's content column: a continuation under `-{.c} x` still has to reach column 2, the same as under `- x`.

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

A tight item's paragraph that carries block attributes keeps its `<p>`, and the
item stays tight (`CARVE-P9-081`):

```
- {.c}
  text
- b
```

```html
<ul>
  <li><p class="c">text</p></li>
  <li>b</li>
</ul>
```

## 20. A typed container is a native admonition

```
::: note
body
:::            ->  <aside class="admonition note" aria-label="Note">
                    <p>body</p>
                  </aside>
```

Djot renders `<div class="note">`. An unrecognized type still renders a div.
Only the element differs - same source, same tree shape - so this is a
rendering difference rather than a parsing one.

**The landmark is named.** The spec gives the `<aside>` an accessible name,
because an unnamed landmark is an anonymous row in a reader's landmark list,
which is the benefit the `<aside>` was chosen for. An untitled admonition is
named by its type
(`aria-label="Note"`); one carrying a quoted title is named by that title
instead, via `aria-labelledby` pointing at the `<p class="admonition-title">`,
so the visible name and the spoken one are one string.

```
::: note "Pro tip"      ->  <aside class="admonition note" aria-labelledby="adm-1">
body                          <p class="admonition-title" id="adm-1">Pro tip</p>
:::                           <p>body</p>
                            </aside>
```

Measured against the 0.1.10 and 0.1.11 engines: it emits both forms. Write the source either way - this is a renderer
detail that changes no source and no tree shape - and do not hand-add
`aria-label` to Carve output.

## 21. Footnote labels normalize spaces only

Djot and Carve both trim a label's ends and collapse internal space runs
before lookup. Carve treats tabs as content and keeps matching case-sensitive. The authored spelling stays available in source
layout data, and colliding definitions are diagnosed.

Given the definition `[^a b]: foo`:

```
[^a b]         ->  binds
[^a  b]        ->  binds               (two spaces collapse)
[^a	b]        ->  literal text        (a tab is content)
[^ a b ]       ->  binds               (the ends are trimmed)
[^A b]         ->  literal text        (case is not normalized)
```

The spec and the 0.1.11 engine both leave a tabbed reference literal beside a
definition spelled with a space. Write labels with spaces.

What Carve does NOT do is fold a newline: a reference may not be wrapped.

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

A footnote reference inside link text, `[see[^1]](/u)`, renders as a bare
`<sup>` in the 0.1.11 engine, so the link never holds a second `<a>`. Earlier
engines nested the note link inside the outer link.

## Table cells

A `^` extends the cell above it and a `<` the cell to its left. With nothing to
extend (a `^` in the first row, a `<` in the first column) or where the span
would cover another cell, the marker renders as an empty cell and the span does
not happen. The 0.1.11 engine reports `table-span-marker-blocked`.
Spaces around a lone marker do not change the span: `|<|`, `| <|`, `|< |`,
and `| < |` all merge. The same holds for `^`. A consumed alignment run takes
precedence, so `|= <|` is a header cell containing `<`.

An alignment marker on a native head-row `|=` cell sets the default for its
starting physical column, including body cells. A later row-header `|=` marker
sets that cell only. A colspan does not copy the default into covered columns.
A plain `|` marker stays local even if `header-rows` promotes its row to the
header. Where a column has both a head-row marker and a GFM delimiter colon,
the marker wins: `|=> a |` over `|:-- |` right-aligns the column.

A row whose cells are all blank is a table row when every cell is delimited:
`| |` is one empty data cell and `| | |` two. carve-js 0.1.12 and 0.1.13 render `| |`
as a one-cell table; 0.1.10 rendered it as paragraph text.

A cell marker may carry a second, vertical axis, horizontal first:
`<^ <~ <v ~^ ~~ ~v >^ >~ >v` are runs, while `v>` and a lone `^` or `v` stay
ordinary cell content. `?` keeps the column's horizontal axis and sets only the
vertical one:

````
|=>^ Qty |
|?v 15 |
````

````html
<table>
  <thead>
    <tr><th scope="col" style="text-align: right; vertical-align: top;">Qty</th></tr>
  </thead>
  <tbody>
    <tr><td style="text-align: right; vertical-align: bottom;">15</td></tr>
  </tbody>
</table>
````

`vertical_cell_alignment` in `references/capabilities.json` re-measures this
each release.

## Delimited tables

A `{table}` attribute line turns a fence whose language is exactly `csv` or
`tsv` into a table of literal fields. Quoted fields follow RFC 4180 and may hold
newlines. The first record is the header unless `header-rows=0` is set, other
table attributes apply, and a `^` caption after the fence captions the table:

````
{table}
```csv
Name,Score
"Lee, A",3
```
^ Results
````

Without `{table}` the fence stays a code block. Malformed quoting also leaves it
code and reports `delimited-table-malformed`; a record wider than the first is
kept and reports `delimited-table-wide-row`. Fields get no inline parsing, spans
or per-cell attributes, and `fmt` keeps the delimited form. Spec 0.1.10,
carve-js 0.1.12.

The data can live in its own file: put `{table}` above `{{ data/plans.csv @code:csv }}`.
Lint then reports `delimited-table-*` at the data file's line when given an include
root.

## Include regions and code includes

`@region:name` selects the lines between a `#region name` line and a `#endregion`
line, marker lines excluded. Keywords are lowercase, names compare exactly and occur
once per file, and an end marker may omit the name. Which comment spells a marker
depends on what the include becomes, and `fmt` keeps a marker on its own line (`CARVE-P11-073`):

- **Read as Carve**: only `%% #region name`, which renders nothing. A bare
  `#region`, `// #region` or `{% #region %}` line is text in a Carve file; lint
  reports `region-marker-renders-as-text` and an include naming it gives
  `include-region-invalid`.
- **Read as code** (`@code:lang`): the comments source files use, one per line:
  `#`, `//`, `--`, `/* */`, `<!-- -->`, and `%%`.

`@code:lang` includes the selection (whole file, `@lines` or `@region`) as ONE code
block and parses nothing as Carve. The language is never guessed from the
extension. An attribute line above the directive lands on the block:

```
{.scroll}
{{ src/server.js @region:start @code:js }}
```

`#section` with `@code` is `include-selection-conflict`, as is combining `#section`,
`@lines` and `@region`; `@code` in a sentence is `include-block-in-inline`. A missing,
duplicate or unclosed region is `include-region-invalid`. The directive stays literal.

`@code` and Carve-only region markers arrived in carve-js 0.1.13, whose lint also
expands includes under `--include-root`. carve-js 0.1.12 reports `@code` as
`include-unknown-option`, so render with the target engine first.

## Empty destinations, graphemes and atomic spans

An empty destination is explicit (`CARVE-P3-024`): `[t]()` and `![t]()` are a
link and an image with `href=""` / `src=""`, and a bare `[label]:` defines an
empty destination instead of staying paragraph text. Lint reports that
definition as `empty-reference-definition` in case a URL was lost. Before spec
0.1.10 all three were literal text.

A delimiter counts only as a whole grapheme (`CARVE-P3-025`). One followed by a
combining mark, a variation selector or U+200D is text, so `*a*` directly
followed by U+0301 stays literal. Braced openers and `{%` take the same guard.

Autolinks, cross-references and comments are atomic: no delimiter, closer,
arrow or bracket outside one reads inside it. `*see <https://a.b/*x> here*` is
one bold run around an intact link.

All three measured on carve-js 0.1.12.

## Source encoding and media type

Save Carve as `.crv`. The media type is `text/x-carve; charset=utf-8` on every
transport (`CARVE-P9-071`); a clipboard flavor stays the bare `text/x-carve`.
Each ill-formed UTF-8 sequence or lone surrogate becomes U+FFFD before the
first line is read, so bad bytes never reject a document (`CARVE-P0-023`). An
included file that is not well-formed UTF-8 is refused instead.
