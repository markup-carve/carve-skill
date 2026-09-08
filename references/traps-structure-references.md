# Structure and reference traps

Headings, attributes, tight-list attachment, admonitions, and footnote labels.

This guide owns traps 14–21; cross-references to 1–6 open the foundation guide,
and 7–13a open the block/container guide. It is sourced from the spec's
`docs/divergence-from-djot.md` and drift-checked against that source.

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

## 20. A typed container is a native admonition

```
::: note
body
:::            ->  <aside class="admonition note"><p>body</p></aside>
```

Djot renders `<div class="note">`. An unrecognized type still renders a div.
Only the element differs - same source, same tree shape - so this is a
rendering difference rather than a parsing one.

**The landmark is named, and the released engine does not name it yet.** The
spec gives the `<aside>` an accessible name, because an unnamed landmark is an
anonymous row in a reader's landmark list, which is the benefit the `<aside>`
was chosen for. An untitled admonition is named by its type
(`aria-label="Note"`); one carrying a quoted title is named by that title
instead, via `aria-labelledby` pointing at the `<p class="admonition-title">`,
so the visible name and the spoken one are one string.

```
::: note "Pro tip"      ->  <p class="admonition-title">Pro tip</p>
body                        is the title, and names the aside
:::
```

Measured against `@markup-carve/carve` 0.1.5, the engine this skill is tested
against: it emits neither attribute yet, so the HTML above is what you get
today. Write the source either way - this is a renderer detail that changes no
source and no tree shape - but do not hand-add `aria-label` to Carve output,
and do not treat its absence as a reason to write raw HTML instead.

## 21. Footnote labels normalize ASCII whitespace

Djot and Carve both trim a label's ends and collapse its internal whitespace
runs before lookup. Carve defines that operation over ASCII whitespace and
keeps matching CASE-SENSITIVE. The authored spelling stays available in source
layout data, and colliding definitions are diagnosed.

Given the definition `[^a b]: foo`:

```
[^a b]         ->  binds
[^a  b]        ->  binds               (two spaces collapse)
[^a	b]        ->  binds               (a tab collapses)
[^ a b ]       ->  binds               (the ends are trimmed)
[^A b]         ->  literal text        (case is not normalized)
```

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
