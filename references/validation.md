# Validation loop

Carve parses tolerantly, so many mistakes render as the wrong thing instead of erroring. The linter catches those silent failures. **Always run it after authoring or editing a `.crv` and fix every finding before you finish.**

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

## Command

```sh
carve lint file.crv
carve lint docs/**/*.crv
carve lint < file.crv
```

Exit `0` = clean, `1` = findings, `2` = command/read error. One finding per line: `file:line:col rule — message`.

## Default vs `--from-djot`

- **Default** targets hand-written Carve. It flags constructs that mis-render: `**bold**`, `~~strike~~`, `^sup^`, `+` bullets, broken `</#id>` cross-references, duplicate heading ids, unresolved reference links, missing/duplicate/unused footnotes, trailing `{…}` attributes on a heading line, and legacy `` ```raw FORMAT `` fences.
- **`--from-djot`** additionally flags valid Carve whose meaning merely *differs* from Djot — `_x_` (underline), `~x~` (strikethrough), `{=x=}` (highlight). Use it **only** when checking a document migrated from Djot; on hand-written Carve those are intentional and flagging them is noise.

## The round-trip you are aiming for

Author a document using several constructs, then:

```sh
carve lint file.crv        # no --from-djot
```

must be clean. Run it over every touched `.crv`/`.carve` file, not only the
smallest example. If it is not clean, fix per the finding and re-run. Common
fixes map straight to [traps.md](traps.md): `**b**` → `*b*`, `~~s~~` → `~s~`,
`^x^` → `{^x^}`, `+ item` → `- item`, trailing heading `{#id}` → move it above.

Lint checks known hazards; it does not prove semantic intent. When changing
containers, captions, references, raw target routing, extensions, or generated
PR/issue snippets, also use the project's parser/render tests or preview and
confirm the relevant structure. Do not run `carve fmt` across existing authored
source unless canonicalization was requested.

## Getting the linter

`carve lint` ships with the TypeScript implementation (`@markup-carve/carve` on npm; `npx carve lint …`). The language server (`@markup-carve/carve-lsp`) surfaces the same diagnostics in-editor. Programmatic callers use `lintCarve(source)`.
