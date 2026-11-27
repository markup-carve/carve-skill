# Migrating 0.1 source to 0.2

Read the [upgrade guide](../spec/spec/0.2/UPGRADING.md) and [upgrade map](../spec/spec/0.2/data/upgrade-map.json). A source file that parses in both versions can still change HTML.

Work on a copy. With the 0.2 CLI (`npm i -g @markup-carve/carve@^0.2`), run `carve upgrade --check FILE`, then inspect `upgrade --json FILE`. Use `upgrade --write FILE` only after reviewing the report and the original file. Run the tool once per 0.1 file; it is not idempotent on upgraded source. Format the result and compare representative 0.1 and 0.2 HTML. The 0.2 `upgrade` command is reference-engine specific, not part of the shared tooling contract. `upgrade --migrate` also respells a reference that misses its only target by case (U-429), and `--registered-extension wikilinks` or `samp` rewrites `[[Page]]` and `:samp[...]` only where the 0.1 host registered them (U-423 to U-425).

Migration notices (the `deprecated-` rules, most `djot-` rules, `thematic-break-spelling`, `continuation-reading-changed` and the other rules whose catalog default is `upgrade`) are off for a 0.2 document. Run `lint --upgrade FILE` on the 0.1 source before upgrading it, or keep `carve: 0.1` in its frontmatter until it is upgraded; a clean default lint does not show what 0.2 reads differently.

Look first at block boundaries, `+` lines, list tightness, thematic breaks, fences, table headers, inline delimiters, and raw HTML. Update integrations separately: on carve-js `main` the package root `@markup-carve/carve` is the 0.2 API, and `docs/api.md` maps each 0.1 call. Stored ASTs need the 2.0 schema or `migrateTree`.

## Worked 0.2 example

```crv
A {_word_}.
```
```html
<p>A <u>word</u>.</p>
```
