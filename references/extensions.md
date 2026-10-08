# Extensions (Tier-2 / Tier-3)

Beyond the core (Tier-1) syntax, Carve has opt-in extensions. **The syntax is stable, but whether a construct renders depends on the processor and host** — do not assume these work everywhere. Check the target's [feature → tier table](https://github.com/markup-carve/carve/blob/main/docs/extension-contract.md).

- **Tier-2** — standard, cross-implementation extensions with output pinned in the optional corpus (citations, code callouts, list-tables, Details, Spoiler, Tabs).
- **Tier-3** — optional transforms and host-dependent renderers (mermaid, charts, MathBlock, TOC, glossary/index/bibliography). Their underlying inline, div, or fence syntax still parses when the extension is absent; each feature defines its own fallback. For example, an unhandled mermaid fence remains source code.

## Common extension constructs

| Construct | Syntax | Tier |
|-----------|--------|------|
| Inline extension | `:type[content]{attrs}` (e.g. `:youtube[ID]`) | syntax core, handler opt-in |
| Citation | `[@key]`, `[@key, p. 5]`, `[-@key]` (suppress author), `[+@key]` (integral) | Tier-2 |
| Code callouts | `<1>` markers in a code fence, bound to an `<ol>` | Tier-2 |
| List-table | `::: list-table` block | Tier-2 |
| Symbols | `:name:` (rendered via the processor `symbols` map; literal fallback) | core syntax |
| Table of contents | `::: toc` (with `depth` / `from` / `to`) | Tier-3 |
| Footnotes relocation | `::: footnotes` | core |
| Glossary / Index / Bibliography | `::: glossary`, `:index[term]` / `::: index`, `bibliography` option | Tier-3 |
| Heading numbers | opt-in section auto-numbering (`1.1`) | Tier-3 |
| Mermaid / chart / MathBlock fences | ` ```mermaid `, ` ```chart `, ` ```math ` | Tier-3 (renderer); core `$$…$$` display math needs no extension |

## Placement markers place only at document top level

`::: footnotes`, `::: bibliography` and `::: references` move a document-wide
region, and only a marker at document top level does so. Inside a block-level
container (a quote, a list item, a div or directive body, a table cell, a
definition description, a footnote definition) the marker renders the
`<div class="{kind}">` fallback where it stands and the region goes where an
unmarked document puts it (`CARVE-P9-073`). The spec names a diagnostic for that
shape, `{kind}-placement-in-container`. `@markup-carve/carve` 0.1.10 emits the
footnotes one and neither of the other two, so a misplaced `::: bibliography` or
`::: references` still passes lint and only the render shows it. `::: toc`,
`::: glossary` and `::: index` are placeable at any depth.

The spec keeps authored directive bodies as well as generated content.
Footnotes and TOC bodies precede the generated section or nav as sibling
blocks. An index writes its title, label, authored body, then its list;
references keep authored blocks before the list inside the references div.
When at least one note is referenced, the first eligible top-level footnotes
marker places the section (`CARVE-P9-075`). Later markers, or every marker when
no note is referenced, keep their bodies in fallback divs. A marker nested in a TOC body
remains nested even when that body renders before the nav (`CARVE-P9-076`).
Preview these placements on the chosen host. On 0.1.10, a paragraph inside
the first top-level footnotes marker renders before the endnotes section.

A quoted title and an opener `[label]` on any placement marker belong to the
element it places, title first (`CARVE-P9-072`), except where that element
cannot hold a paragraph: `glossary` places a `<dl>` and `index` a `<ul>`, so for
those two the tokens precede the generated content instead. The fallback `<div>`
takes them as children and takes no naming attribute.

0.1.10 carries them on a PLACING marker too, so a title is safe to write.
`::: footnotes "Reader notes" [End]` renders the endnotes `<section>` with
`aria-labelledby` pointing at a `<p class="admonition-title">` holding the
title, and the label after it as `<p class="div-label">`. Through 0.1.7 the
marker dropped both when it placed
([markup-carve/carve-js#2073](https://github.com/markup-carve/carve-js/issues/2073)),
so leave a placing marker untitled when the consumer is on an older engine;
`directive_title` in [capabilities.json](capabilities.json) re-measures it each
release.

## Guidance for agents

- Prefer **core** constructs unless the user names a host that supports the extension.
- When you use a Tier-3 construct, say so and note it needs a supporting processor.
- Extensions never change the core rules — the emphasis swap, braced sup/sub, `%%` comments, etc. still apply inside extension content.
