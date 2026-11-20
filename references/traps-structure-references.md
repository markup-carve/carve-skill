# Structure and reference traps

## Sections and headings

0.2 HTML renders headings and sections according to [C2-H](../spec/spec/0.2/html.md#paragraphs-headings-and-sections). Generated ids, section boundaries, and repeated headings need actual render checks. `lint` reads `headingIds` (`--heading-ids`), so `broken-fragment-link` checks against the ids your render option generates; lint with the same value. A source heading can use `=` or `#`; `=` is the simple canonical spelling. Put attributes above the heading.

## Definitions and links

A reference definition starts at a block boundary. A reference use resolves by the 0.2 label rules; unresolved forms can remain text and report diagnostics. `</#id>` is a cross-reference, not a literal path. Link destinations and images follow the HTML URL policy, which the host chooses. See [inline references](../spec/spec/0.2/syntax-inline.md#reference-resolution).

## Footnotes and captions

`[^note]` refers to a footnote definition. Captions begin `^ ` after an eligible figure, table, code block, or math block. A caption can absorb a following line until a blank boundary. Inspect generated HTML for note placement and caption numbering. See [HTML footnotes](../spec/spec/0.2/html.md#footnotes) and [block captions](../spec/spec/0.2/syntax-blocks.md#captions).

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
