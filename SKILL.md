---
name: carve-authoring
description: Use when writing or editing Carve markup (`.crv` / `.carve` files), or when the user asks to author Carve. Carve is a post-Markdown lightweight markup language that deliberately diverges from Markdown/Djot — the emphasis delimiters are swapped (`/italic/`, `*bold*`), sup/sub are braced-only, and several Markdown habits produce wrong output. This skill front-loads the correct syntax and the traps so the output is valid Carve the first time.
---

# Authoring Carve

Carve's mnemonic: **the markup looks like its output.** It starts from [Djot](https://djot.net) but breaks source-compatibility in a few places to remove footguns. If you write Carve with Markdown habits, it silently mis-renders — so read the traps below before writing.

Files use the **`.crv`** extension (`.carve` also accepted).

## Establish the target before writing

Before using syntax whose behavior can vary, inspect the project and determine:

1. the Carve implementation and installed version;
2. the output renderer (HTML, Markdown, ANSI, plain text, or a host integration);
3. which Tier-2/Tier-3 extensions the host enables; and
4. whether the user wants authored spelling preserved or canonical formatting.

Use core syntax when any of those facts is unknown. Do not copy a construct from
the current spec into a project whose released engine does not implement it.
[references/capabilities.json](references/capabilities.json) records the known
version boundaries; [references/workflows.md](references/workflows.md) gives the
discovery and editing playbooks.

## The rules you will get wrong (read first)

These are the Markdown/Djot habits that break in Carve. Full list with rationale in [references/traps.md](references/traps.md).

1. **Emphasis is swapped.** `/italic/` is italic (slashes lean), `*bold*` is bold. `_underline_` is **underline**, not italic. Bold-italic is `/*text*/`.
2. **`**bold**` and `~~strike~~` are NOT Carve.** Double delimiters render with literal characters. Bold is a single `*`; strikethrough is a single `~` (`~strike~`).
3. **Superscript/subscript are braced-only.** `{^text^}` and `{,text,}`. Bare `^x^` and `,x,` are literal text. (`~x~` is strikethrough here, not subscript.)
4. **Highlight is `=text=`** (single equals).
5. **Heading attributes go on the line ABOVE**, not trailing: write `{#id .class}` then `# Heading`. A trailing `{#id}` on a heading line is literal text.
6. **`+` is the list-continuation marker, not a bullet.** Bullets are `-` and `*` only. A lone `+` on its own line attaches the next flush-left block to the current item. `+ text` is a paragraph.
7. **A list marker needs content.** A lone `-` (or `- `) is paragraph text, not an empty list item.
8. **Cross-references are `</#id>`** — the link text is auto-filled from the target heading. Implicit heading links: `[Heading][]`.
9. **Block markers interrupt paragraphs** (Markdown-like): a `#`/`>`/fence/table line directly under prose starts a block. Exception: list markers do NOT interrupt (a list still needs a blank line before it).
10. **Comments are `%%`** to end of line (or a `%%%` fenced block), never `<!-- -->`. Djot's `{% … %}` works too, for commenting mid-prose without splitting the paragraph, and is live in every released engine (trap 6).
11. **Definition lists use explicit markers:** `:: term` then `:  definition` (single colon + two spaces). Djot's `: term` + indented body does not work.
12. **A code fence must be longer than any bare same-character fence line inside it.** Content holding a three-backtick line needs a four-backtick wrapper; at equal length the inner line closes the block early and the sample renders as live markup. `:::` containers widen outward too (trap 13), for a different reason that will part company with this one at equal length — so keep the habit, not the explanation. It applies wherever you write Carve (an issue body, a PR description, a chat answer), not only in a file (trap 13a).

## Core syntax (quick)

Full card in [references/syntax.md](references/syntax.md).

- **Inline:** `/italic/` `*bold*` `_underline_` `~strike~` `=highlight=` `` `code` `` `{^sup^}` `{,sub,}` `[text](url)` `<https://auto>` `</#section-id>` `![alt](img.jpg)` `[^1]` reference footnote / `^[inline note]` `[span]{.class}` `@user` `#tag`. Escape with `\`. Force an intraword delimiter with the brace form: `H{,2,}O`, `mc{^2^}`.
- **Headings:** `#`..`######`; attributes on the line above (`{#id .class}`).
- **Lists:** `-`/`*` unordered, `1.`/`1)` ordered (also `a.` `A.` `i.` `I.`), `- [ ]`/`- [x]` tasks. `+` continues an item.
- **Tables:** `|= Header |` header cells, `|=>`/`|=<`/`|=~` alignment, `^` rowspan, `<` colspan, `+ cell` multi-line, `^ Caption` after the table. A GFM `|---|` separator row is accepted as an alias.
- **Code:** ` ```language "Header" [Label] ` (no space after the backticks; `"Header"`→`<pre title>`, `[Label]`→code-group tab). Raw pass-through: ` ```=html `.
- **Divs / admonitions:** `::: note "Title"` … `:::` (types: note tip warning danger info success example quote; any other word → generic `<div>`). Longer fences (`::::`) nest shorter ones. Titles must be straight-quoted.
- **Blockquotes:** `>`; `^ Attribution` caption; a lone `+` at column 0 attaches the next block.
- **Math:** inline `` $`e^{i\pi}+1=0` ``, display `` $$`\int_0^1 x\,dx` ``.
- **Captions:** a `^ Caption` line after an image/table/code/`$$`-math block; `^ Figure #:` auto-numbers, referenced by `</#id>`.
- **Attributes:** `{#id .class key=value}` on the line above/below the target; bare words are boolean attributes (`{.note open}`).
- **Frontmatter:** a leading `---` block (add `---toml` / `---json` for other formats).
- **Editorial (CriticMarkup):** `{+inserted+}` `{-deleted-}` `{~old~>new~}` `{#a comment#}`.

## Extensions (opt-in)

Some constructs are Tier-2/Tier-3 extensions, enabled per-processor and **host-dependent** — do not assume they render everywhere. Details in [references/extensions.md](references/extensions.md): citations `[@key]`, glossary/index/bibliography, table of contents, symbols `:name:`, `:type[content]{attrs}` inline extensions, mermaid/chart/math fences.

## Always validate before finishing

Carve ships a linter that catches constructs that parse but render wrong. After authoring or editing a `.crv`, run it and fix every finding:

```sh
./node_modules/.bin/carve lint file.crv
```

- Default lint targets hand-written Carve (flags `**bold**`, `~~strike~~`, `^sup^`, `+` bullets, broken `</#id>`, duplicate ids, trailing heading attributes, etc.).
- Add `--from-djot` **only** when checking a document migrated from Djot (it also flags `_x_`/`~x~`/`{=x=}`, which are valid in hand-written Carve).

Never install a validator merely to finish a task. Prefer a project script or
local binary, then `npx --no-install carve`; use a global `carve` only when its
version matches the project. Lint every touched Carve file and report the command
and version. A clean lint is necessary but not proof of the intended rendering;
inspect rendered or parsed output when structure or target routing matters.

The round-trip you are aiming for: author using several constructs → lint is
clean with no `--from-djot` → rendered structure matches the request. See
[references/validation.md](references/validation.md).

## Editing and document quality

Make the smallest local edit that satisfies the request. Preserve nearby
delimiter choices, attributes, indentation, line endings, and container widths;
do not canonicalize or rewrite a whole document unless asked. For issue, PR, or
chat bodies, widen the *outer* Markdown fence beyond every bare fence line in the
Carve sample and preview the body before submitting it.

Write useful alt text, keep heading levels logical, use meaningful link text and
table headers/captions, and treat raw HTML, remote embeds, template syntax, and
Tier-3 renderers as host-controlled trust boundaries. The complete checklist is
in [references/quality-and-safety.md](references/quality-and-safety.md).
