# carve-skill

A Claude Code / agent authoring skill for [Carve](https://github.com/markup-carve/carve) — teaches AI coding tools to write valid, idiomatic `.crv` the first time.

Carve deliberately diverges from Markdown/Djot (the emphasis delimiters are swapped, sup/sub are braced-only, `+` is a continuation marker, and more). An agent that defaults to Markdown habits emits Carve that silently mis-renders. This skill front-loads the correct syntax and the traps, and points the agent at `carve lint` to verify.

## Contents

- **[SKILL.md](SKILL.md)** — the skill: trigger description, the traps you'll get wrong, a quick syntax card, and the validation loop.
- **[references/traps.md](references/traps.md)** — every Markdown/Djot divergence (the "do not do this" list).
- **[references/syntax.md](references/syntax.md)** — the full core syntax card.
- **[references/extensions.md](references/extensions.md)** — Tier-2/Tier-3 opt-in constructs.
- **[references/validation.md](references/validation.md)** — the `carve lint` round-trip.

## Install (Claude Code)

Point Claude Code at this repo as a skill/plugin so it activates when you author `.crv` files. The skill is a plain `SKILL.md` + `references/` bundle, portable enough for other agents to reuse.

## Not drifting

The syntax card and trap list are sourced from the canonical spec docs, vendored as the `spec` submodule. A [drift guard](test/drift.test.mjs) fails CI if the skill falls behind the spec, and a round-trip test lints an [example document](examples/showcase.crv) to prove the taught syntax is valid Carve.

The guard has to catch two different failures, because a check that reads its own pinned input cannot see that input move:

- **The skill fell behind its pin.** The trap list must have a section for every numbered divergence in the pinned spec, and every essential construct must still appear in both the spec cheatsheet and the skill.
- **A divergence was rewritten under the same heading number.** [`test/spec-review.json`](test/spec-review.json) records which *text* of each numbered section the trap list was last read against. A submodule bump that rewrites a section fails until someone re-reads it — the case that slipped through when the spec inverted the container rule inside section 13 without renumbering it.
- **The pin itself fell behind.** `npm test` cannot see that; the scheduled [spec-drift workflow](.github/workflows/spec-drift.yml) runs the same section comparison against `markup-carve/carve` main and fails when one has moved.

```sh
git submodule update --init
npm ci
npm test              # drift guard, against the pinned spec
npm run lint:examples # round-trip: the showcase must lint clean

npm run spec:check    # which sections moved, without the test harness
npm run spec:review   # record the review — AFTER re-reading the sections it names
```

## License

MIT — see [LICENSE](LICENSE).
