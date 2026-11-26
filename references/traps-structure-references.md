# Structure and reference traps

## Sections and headings

0.2 HTML renders headings and sections according to [C2-H](../spec/spec/0.2/html.md#paragraphs-headings-and-sections). Generated ids, section boundaries, and repeated headings need actual render checks. `lint` reads `headingIds` (`--heading-ids`), so `broken-fragment-link` checks against the ids your render option generates; lint with the same value. A page that writes its own title as the `<h1>` sets the render option `headingShift` (`--heading-shift`, 0 to 5, default 0, [C2-H-208](../spec/spec/0.2/html.md#options)): with 1, `=` renders as `<h2>`, at every depth and in expanded includes, while ids, cross-references, the tree and `fmt` output keep the authored levels. A shifted level above 6 renders as `<div role="heading" aria-level="N">` with one `heading-shift-above-6` warning. A source heading can use `=` or `#`; `=` is the simple canonical spelling. Put attributes above the heading.

## Definitions and links

A reference definition starts at a block boundary. One line indented below a link definition can carry its title or attribute block; a brace line there is not an attribute line for the next block. A reference use resolves by the 0.2 label rules; unresolved forms can remain text and report diagnostics. `</#id>` is a cross-reference, not a literal path. Link destinations and images follow the HTML URL policy, which the host chooses. See [inline references](../spec/spec/0.2/syntax-inline.md#reference-resolution).

## Footnotes and captions

`[^note]` refers to a footnote definition. Captions begin `^ ` after an eligible figure, table, code block, or math block. A caption continues only on lines indented past its `^`, as a heading does; an unindented line starts the next block, and a second `^` line directly below a caption is text that `unattached-caption` reports. Inspect generated HTML for note placement and caption numbering. See [HTML footnotes](../spec/spec/0.2/html.md#footnotes) and [block captions](../spec/spec/0.2/syntax-blocks.md#captions).

## Attributes and cells

An attribute line sits immediately before its target; an inline attribute block follows its inline target. Cell alignment uses brace prefixes. Semantic span keys such as `kbd`, `abbr`, and `time` can change the HTML element, so verify the resulting tree and HTML. See [HTML attributes](../spec/spec/0.2/html.md#attributes).

## Includes

Includes need a resolver and an allowed root. Selection by section, lines, region, or code mode changes which content is read. `fmt` does not expand directives; `carve flatten` is the one source-writing command that does. A failed resolution is diagnostic information. See [includes](../spec/spec/0.2/includes.md) and [tooling](../spec/spec/0.2/tooling.md).

## Worked 0.2 example

```crv
|= Name |
| Ada |
```
```html
<table>
  <thead>
    <tr><th scope="col">Name</th></tr>
  </thead>
  <tbody>
    <tr><td>Ada</td></tr>
  </tbody>
</table>
```
