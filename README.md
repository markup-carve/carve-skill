# carve-skill

A Claude Code / agent authoring skill for [Carve](https://github.com/markup-carve/carve) — teaches AI coding tools to write valid, idiomatic `.crv` the first time.

Carve deliberately diverges from Markdown/Djot (the emphasis delimiters are swapped, sup/sub are braced-only, `+` is a continuation marker, and more). An agent that defaults to Markdown habits emits Carve that silently mis-renders. This skill front-loads the correct syntax and the traps, and points the agent at `carve lint` to verify.

## Contents

- **[SKILL.md](SKILL.md)** — the skill: trigger description, the traps you'll get wrong, a quick syntax card, and the validation loop.
- **[references/traps.md](references/traps.md)** — every Markdown/Djot divergence (the "do not do this" list).
- **[references/syntax.md](references/syntax.md)** — the full core syntax card.
- **[references/extensions.md](references/extensions.md)** — Tier-2/Tier-3 opt-in constructs.
- **[references/validation.md](references/validation.md)** — the `carve lint` round-trip.
- **[references/capabilities.json](references/capabilities.json)** — machine-readable released/spec/host support boundaries.
- **[references/workflows.md](references/workflows.md)** — new-document, editing, migration, PR-body, container, and extension playbooks.
- **[references/quality-and-safety.md](references/quality-and-safety.md)** — accessibility, raw-output, embed, and host-safety checks.

## Install

Install or link this directory as a skill in Claude Code, Codex, or another agent
that accepts `SKILL.md` bundles. The package deliberately has no runtime hook:
`SKILL.md` and the complete `references/` directory must remain together.

## Not drifting

The syntax, traps, extensions, validation, and quality-and-safety reference pages are sourced from the canonical spec docs, vendored as the `spec` submodule. A [drift guard](test/drift.test.mjs) fails CI if the skill falls behind the spec, and a round-trip test lints an [example document](examples/showcase.crv) to prove the taught syntax is valid Carve.

The guard has to catch eight different failures, because a check that reads its own pinned input cannot see that input move, a check that names its inputs cannot see the ones it did not name, and a check that looks for a token cannot see the meaning around it change:

- **The skill fell behind its pin.** The trap list must have a section for every numbered divergence in the pinned spec, and every essential construct must still appear both in the spec cheatsheet and in [`references/syntax.md`](references/syntax.md), the one page that undertakes to name every core construct. A mention on another page does not stand in for it: the check used to read all five pages concatenated, so a construct could leave the page that teaches it and stay green.
- **A divergence was rewritten under the same heading number.** [`test/spec-review.json`](test/spec-review.json) records which *text* of each numbered section the trap list was last read against. A submodule bump that rewrites a section fails until someone re-reads it — the case that slipped through when the spec inverted the container rule inside section 13 without renumbering it.
- **A rule stated in the AST schema moved.** [`test/schema-review.json`](test/schema-review.json) does the same per node definition of `spec/resources/ast-schema.json`, which states language rules in prose — block promotion, resolution timing, which fields survive a round trip. A pin bump that rewrites a node description fails until someone re-reads it and confirms no reference page now teaches the old rule.
- **A normative rule was added, retired or retitled.** [`test/rules-review.json`](test/rules-review.json) fingerprints `spec/resources/spec/rules.json` per active rule id — the registry the grammar's clause inventory and the six generated views under `spec/docs/rules/` both come from. Every ledger before it watched prose or a schema, so the normative surface itself was unwatched: `CARVE-P0-020`, the rule that decides which container owns a line landing between two open content columns, was added in the exact area trap 17 of [`references/traps.md`](references/traps.md) teaches, and every gate here stayed green. The fingerprint is the rule's part and title, not its scope — the scopes are navigation views, and hashing them made one metadata addition read as 242 moved rules, which is the kind of ledger that gets recorded without being read.
- **A cheat-sheet row was rewritten around its token.** [`test/cheatsheet-review.json`](test/cheatsheet-review.json) fingerprints `spec/docs/cheatsheet.md` per row — table row, notation fence, and the prose between them. The cheat sheet is the source [`references/syntax.md`](references/syntax.md) is written from, and it used to be checked only for whether thirteen construct tokens were PRESENT, so a row could keep `{,sub,}` while the columns explaining it were rewritten into the opposite rule and every gate stayed green. The parse is total — every line of the card lands in exactly one row — and a test asserts that, because a ledger that covers most of a document has the same blind spot in miniature.
- **A topic source was rewritten under the same heading.** [`test/extensions-review.json`](test/extensions-review.json), [`test/validation-review.json`](test/validation-review.json), and [`test/security-review.json`](test/security-review.json) fingerprint the preamble and H2/H3 sections behind the extension, validation, and quality-and-safety reference pages. H3 identity includes its H2 parent, numbering-only churn is ignored, and a fenced example that contains heading syntax remains part of its real section rather than becoming a false ledger entry.
- **The pin itself fell behind.** `npm test` cannot see that; the scheduled [spec-drift workflow](.github/workflows/spec-drift.yml) runs the same comparison against `markup-carve/carve` main and fails when one has moved.
- **The ENGINE pin fell behind.** The spec pin and the engine are two different pins. `references/traps.md` carries version-dated measurements, and a dated note is only evidence while its premise holds, so the scheduled workflow fails when the lockfile's `@markup-carve/carve` is not the newest published release. It was added after a claim was written up as a gap the newest release did not have, measured against a lockfile one release behind.

What the guard watches is a list, [`scripts/review-ledgers.mjs`](scripts/review-ledgers.mjs), read by the test, the offline checker and the workflow alike. A guard that names its inputs can only see what is named, so the list is in one place and adding a document to it is one entry.

```sh
git submodule update --init
npm ci
npm test              # drift guard, against the pinned spec
npm run lint:examples # round-trip: the showcase must lint clean

npm run spec:check    # what moved, without the test harness
npm run spec:review   # record the review — AFTER re-reading what it names
```
