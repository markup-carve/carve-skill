# carve-skill

A skill for authoring, reviewing, validating, and migrating Carve 0.2 documents. The 0.2 dialect is a development freeze candidate on the `next2` branches of [carve](https://github.com/markup-carve/carve) and [carve-js](https://github.com/markup-carve/carve-js).

Install this directory as a `SKILL.md` bundle with its `references/` and `agents/` directories. The skill and references are hand-written against the pinned `spec` submodule. They are not generated from upstream prose. The source inventory in `references/capabilities.json`, the pinned submodule, and the sample checker keep the hand-written guidance reviewable as 0.2 changes.

The 0.2 reference CLI is `node dist/cli.js` (installed name `carve`) in a built `carve-js` `next2` checkout. Check `--help` for commands and flags. The 0.2 library is the package root `@markup-carve/carve`, with the separate entries `@markup-carve/carve/import`, `@markup-carve/carve/export`, and `@markup-carve/carve/extensions`.

Run `npm test` for the repository checks and `npm run samples:check` with `CARVE_CLI` set to an absolute path to a built carve-js `next2` `dist/cli.js`. The sample checker extracts every `crv` fence in `SKILL.md` and `references/`, then lints, formats, and renders each. It compares adjacent `html` fences when present. The 0.2 source inventory check hashes the pinned chapters and data catalogs; update it after reading changed clauses.

The entrypoint routes to focused references for syntax, traps, extensions, validation, migration, workflows, and safety. Use the [0.2 spec](https://github.com/markup-carve/carve/tree/next2/spec/0.2) for exact behavior and the [upgrade guide](https://github.com/markup-carve/carve/blob/next2/spec/0.2/UPGRADING.md) for 0.1 source.
