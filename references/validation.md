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
and reports nothing for them. If it is not clean, fix per the finding and re-run. Most fixes
map to [foundation traps](traps-foundations.md): `**b**` → `*b*`,
`~~s~~` → `~s~`, `^x^` → `{^x^}`, and `+ item` → `- item`. For a trailing
heading `{#id}`, use [structure trap 18](traps-structure-references.md).

Lint checks known hazards; it does not prove semantic intent. It is also
silent when a fence opener is not an opener at all: ```` ```js {.diff} ```` has
an attribute after the language, so the whole block degrades to an inline code
span. Put the attribute on its own line above the fence, and check the render
when a block matters. When changing
containers, captions, references, raw target routing, extensions, or generated
PR/issue snippets, also use the project's parser/render tests or preview and
confirm the relevant structure. Do not run `carve fmt` across existing authored
source unless canonicalization was requested.

For an include-expanded AST, read `pos.file` as the identity of the source file
whose line, column, and offset coordinates the span uses. Its absence means the
top-level document; do not reinterpret included offsets as parent-file offsets.

## Getting the linter

`carve lint` ships with the TypeScript implementation (`@markup-carve/carve` on npm; `npx carve lint …`). The language server (`@markup-carve/carve-lsp`) surfaces the same diagnostics in-editor. Programmatic callers use `lintCarve(source)`.
