# Validation loop

Carve parses tolerantly, so many mistakes render as the wrong thing instead of erroring. The linter catches those silent failures. **Always run it after authoring or editing a `.crv`; resolve each finding or explicitly confirm why the authored form is intentional before you finish.**

## Find the project validator without changing dependencies

Use the first available option that belongs to the project:

1. A documented package script such as `npm run lint:carve`.
2. `./node_modules/.bin/carve`.
3. `npx --no-install carve` (never omit `--no-install` during discovery).
4. A global `carve`, after checking that its version matches the project.

If none exists, say that validation could not be run. Do not download or install
a validator unless the user authorizes dependency changes.

Record `carve --version` (or the dependency version from the lockfile) in the
handoff whenever version-sensitive syntax is involved.

Confirm the command can fail before trusting a clean run: lint a line you know
is wrong, such as `**x**`, and expect exit `1`. The carve-js 0.1.7 CLI prints
nothing and exits `0` when started through a symlink, which is how
`./node_modules/.bin/carve` and `npx carve` start it. With that version, call
`node node_modules/@markup-carve/carve/dist/cli.js` directly.

## Command

```sh
carve lint file.crv
carve lint docs/**/*.crv
carve lint < file.crv
carve fmt --check file.crv
```

Exit `0` = clean, `1` = findings, `2` = command/read error. One finding per line: `file:line:col rule — message`.
Use `carve lint --json` when tooling needs stable rule ids, source ranges, and
rule-specific details instead of display text.

## Modes and host checks

- **Default** targets hand-written Carve. Its checks include constructs that mis-render: `**bold**`, `~~strike~~`, `^sup^`, `+` bullets, broken `</#id>` cross-references, duplicate heading ids, unresolved reference links, missing/duplicate/unused footnotes, trailing `{…}` attributes on a heading line, and legacy `` ```raw FORMAT `` fences.
- **`--from-djot`** additionally flags valid Carve whose meaning merely *differs* from Djot — `_x_` (underline), `~x~` (strikethrough), `{=x=}` (highlight). Use it **only** when checking a document migrated from Djot; on hand-written Carve those are intentional and flagging them is noise.
- **`--platform github`** enables host-specific checks for bare `@mention` and
  `#123` tokens that GitHub may relinkify after rendering. It is repeatable and
  these checks are off unless a platform is named.

## The round-trip you are aiming for

Author a document using several constructs, then:

```sh
carve lint file.crv        # no --from-djot
```

must be clean. Run it over every touched `.crv` file, not only the
smallest example. Text you wrote yourself must also pass `carve fmt --check`:
lint accepts lenient spellings such as ```` ``` js ```` (canonical ```` ```js ````)
and reports nothing for them. Others only `fmt` reports: a bare `---`
frontmatter opener (canonical `---yaml`), a definition separator padded past
one space, and table cells padded to align a column. None of them is wrong -
the formatter has one spelling for each.

The `+` continuation marker is the one worth knowing before you write it,
because [foundation trap 3](traps-foundations.md) teaches the construct with an
example the formatter rewrites. `CARVE-P11-030` (PART 11 §10c) writes a lone
attached block indented at the item's content column, and keeps the marker only
where two adjacent children written there would re-parse as one block. So this
is canonical and `+` survives:

```
- step one
+
> the first note
+
> the second note, which indentation would merge into the first
- step two
```

while the same item with only the first note canonicalizes to `  > the first
note`. Both spellings parse to the same document; `examples/showcase.crv`
carries the surviving form. Measured on `@markup-carve/carve` 0.1.7.

If lint or `fmt --check` is not clean, fix per the finding and re-run. Most fixes
map to [foundation traps](traps-foundations.md): `**b**` → `*b*`,
`~~s~~` → `~s~`, `^x^` → `{^x^}`, and `+ item` → `- item`. For a trailing
heading `{#id}`, use [structure trap 18](traps-structure-references.md).

Lint checks known hazards; it does not prove semantic intent. It is also
silent when a fence opener is not an opener at all: ```` ```js {.diff} ```` has
an attribute after the language, so the whole block degrades to an inline code
span. Put the attribute on its own line above the fence, and check the render
when a block matters.

The spec has since named a rule for exactly that shape -
`fence-opener-fallback`, for an opener whose info string is not a language plus
an optional `"title"` and `[label]` - but the engine this skill is tested
against does not emit it yet. Measured on `@markup-carve/carve` 0.1.7, the
sample above lints clean and renders as one `<code>` span, so the sentence above
is still the operating rule. `references/capabilities.json` records it as
`fence_opener_fallback_lint` so the next release re-measures it.

`footnotes-placement-in-container` is the same kind of gap. The spec's rule table
names it for a `::: footnotes`, `::: bibliography` or `::: references` marker
written inside a container, where the marker renders the
`<div class="{kind}">` fallback and places nothing (`CARVE-P9-073`). 0.1.7 reports
nothing for it, so read the render rather than the exit code when a placement
marker is not at document top level; `footnotes_placement_lint` in
`references/capabilities.json` re-measures it.

When changing
containers, captions, references, raw target routing, extensions, or generated
PR/issue snippets, also use the project's parser/render tests or preview and
confirm the relevant structure. Do not run `carve fmt` across existing authored
source unless canonicalization was requested.

For an include-expanded AST, read `pos.file` as the identity of the source file
whose line, column, and offset coordinates the span uses. Its absence means the
top-level document; do not reinterpret included offsets as parent-file offsets.

## Getting the linter

`carve lint` ships with the TypeScript implementation (`@markup-carve/carve` on npm; `npx carve lint …`). The language server (`@markup-carve/carve-lsp`) surfaces the same diagnostics in-editor.

A programmatic caller needs BOTH halves, because the CLI runs both and
`lintCarve` is only one of them. `lintCarve(source)` carries the semantic rules
- `broken-crossref`, the footnote rules, `raw-block-syntax`, the table rules.
The Markdown-habit family this skill exists to prevent is not in it:
`djotMigrationWarnings(source)` carries that, and the CLI's default mode keeps
the entries whose `category` is `carve-breakage`, adding `--from-djot` to keep
the `djot-shift` ones too. Measured on `@markup-carve/carve` 0.1.7,
`lintCarve('a **x** b')` returns no findings while `carve lint` on the same
bytes reports `markdown-strong-double-star`. So a caller that runs `lintCarve`
alone and calls the result clean has checked half of what the section above
promises.
