# Extensions (Tier-2 / Tier-3)

Beyond the core (Tier-1) syntax, Carve has opt-in extensions. **The syntax is stable, but whether a construct renders depends on the processor and host** — do not assume these work everywhere. Check the target's [feature → tier table](https://github.com/markup-carve/carve/blob/main/docs/extensions.md).

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

## Guidance for agents

- Prefer **core** constructs unless the user names a host that supports the extension.
- When you use a Tier-3 construct, say so and note it needs a supporting processor.
- Extensions never change the core rules — the emphasis swap, braced sup/sub, `%%` comments, etc. still apply inside extension content.
