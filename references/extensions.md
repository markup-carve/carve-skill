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
shape, `{kind}-placement-in-container`; `@markup-carve/carve` 0.1.7 does not emit
it yet, so lint stays silent and only the render shows it. `::: toc`,
`::: glossary` and `::: index` are placeable at any depth.

A quoted title and an opener `[label]` on any placement marker belong to the
element it places, title first (`CARVE-P9-072`), except where that element
cannot hold a paragraph: `glossary` places a `<dl>` and `index` a `<ul>`, so for
those two the tokens precede the generated content instead. The fallback `<div>`
takes them as children and takes no naming attribute.

0.1.7 carries them only on that fallback. A marker that actually places drops
both, so `::: footnotes "Reader notes" [End]` renders an endnotes section with
neither token anywhere in the output
([markup-carve/carve-js#2073](https://github.com/markup-carve/carve-js/issues/2073)).
Leave a placing marker untitled and unlabeled until that ships; `directive_title`
in [capabilities.json](capabilities.json) re-measures it each release.

## Guidance for agents

- Prefer **core** constructs unless the user names a host that supports the extension.
- When you use a Tier-3 construct, say so and note it needs a supporting processor.
- Extensions never change the core rules — the emphasis swap, braced sup/sub, `%%` comments, etc. still apply inside extension content.
