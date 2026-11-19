# Migrating 0.1 source to 0.2

Read the [upgrade guide](../spec/spec/0.2/UPGRADING.md) and [upgrade map](../spec/spec/0.2/data/upgrade-map.json). A source file that parses in both versions can still change HTML.

Work on a copy. From a built `carve-js` `next2` checkout, run `node dist/cli.js upgrade --check FILE`, then inspect `upgrade --json FILE`. Use `upgrade --write FILE` only after reviewing the report and the original file. Run the tool once per 0.1 file; it is not idempotent on upgraded source. Format the result and compare representative 0.1 and 0.2 HTML. The 0.2 `upgrade` command is reference-engine specific, not part of the shared tooling contract.

Look first at block boundaries, `+` lines, list tightness, thematic breaks, fences, table headers, inline delimiters, and raw HTML. Update integrations separately: on carve-js `next2` the package root `@markup-carve/carve` is the 0.2 API, and `docs/api.md` maps each 0.1 call. Stored ASTs need the 2.0 schema or `migrateTree`.
