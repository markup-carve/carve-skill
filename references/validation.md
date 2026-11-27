# Validate Carve 0.2

The authority is the `main` [tooling contract](../spec/spec/0.2/tooling.md), [writer and lint chapter](../spec/spec/0.2/writer.md), and [lint catalog](../spec/spec/0.2/data/lint-rules.json). Use a 0.2 engine. Install it with `npm i -g @markup-carve/carve@^0.2` and invoke `carve`, or `node dist/cli.js` from a built carve-js checkout.

```sh
node dist/cli.js lint page.crv
node dist/cli.js diagnostics page.crv
node dist/cli.js fmt --check page.crv
node dist/cli.js render page.crv
```

Run from the engine checkout or substitute the full path to `dist/cli.js`. A released 0.1 `carve` command reads a different dialect. Check `node dist/cli.js --help` and the relevant subcommand help for actual flags. `lint --json` returns a structured report. The `parse`, `lint`, and `render-loss` channels have different roles; a clean lint run alone does not prove that a render preserved every feature. `fmt --check` checks canonical source without writing. `fmt --write` writes; `--normalize` may discard measured spelling. Inspect the proposed change before applying it to authored source.

For a new example, require zero lint findings and a clean `fmt --check`. Render any claimed HTML from the exact example. For a sample intentionally showing a finding, label it and verify the expected diagnostic code. The [sample checker](../scripts/check-samples.mjs) applies this to every Carve fence in the skill.

Use `--include-root` for resolvable includes. The written 0.2 contract names `--no-includes`, but this reference CLI checkout does not list that flag in `--help`; check the target engine before relying on it. Raw HTML is escaped by default. If output depends on options or registered extensions, state them with the example. For an HTML import, inspect the import record and losses before using the source. The 0.2 CLI exposes `import`, `migrate-ast`, `flatten` (writes the include-expanded source), and `fix` (the same as `lint --fix`, which rewrites only findings of rules that are on and whose catalog row has a `fix`; add `--write` to replace the file). `lint` also takes `--heading-ids` (lint with the value you render with), `--ignore FILE`, `--strict` (a hint fails too), and `--upgrade` (turns on the migration notices, see [migration](traps-migration.md)); `render` takes `--heading-shift N` (0 to 5) for a page that writes its own title; `render`, `fmt`, `import`, and `flatten` take `--output` (`-o`). carve-js adds Markdown, GFM, Djot, and BBCode import, all outside the shared 0.2 contract. `render --to markdown`, `--to plain`, and `--to ansi` exist in every engine, but their output is engine behavior outside the specification.
