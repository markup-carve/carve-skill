# Spec review, 2026-10-02

Reviewed `9d6d06c2` through `1acc54cf`, a commit on carve main, 10 commits of
lag. The drift guard named 1 validation section, 1 security section and 16
grammar clauses. The divergence, cheatsheet, AST schema, extension guide and
rules ledgers had no changed entries.

The engine stayed at `@markup-carve/carve` 0.1.9, so every version-dated claim
in `references/` keeps the premise it was measured under. The two claims below
were re-measured rather than carried over, because the spec rules behind them
are the ones that moved.

## Reference changes

- **An invalid container title no longer discards the block.** carve#2693 and
  carve#2695 make a recognized fence or type word keep its container and parse
  its children while the opener metadata is dropped and `fence-title-syntax` is
  reported; `spec/docs/validation.md` restates that row the same way. The syntax
  card said flatly that an unquoted or curly-quoted title "makes the line a
  plain paragraph", which is now the released engine's behavior rather than the
  rule. Measured on 0.1.9: `::: note Bare Title` still renders as one `<p>` and
  lints `fence-title-syntax`, so the card states the spec rule and the engine's
  lag side by side, and the validation guide adds it to the list of rules ahead
  of the release. The advice is unchanged: quote the title.
- **Canonical Carve source is not a sanitized artifact.**
  `spec/docs/security.md` and `CARVE-P12-008` / `CARVE-P12-009` now say the
  PART 11 writer preserves authored destinations, denied schemes included, to
  satisfy its round-trip invariant, and owes no `destination-denied` loss for
  one it preserves. HTML, Markdown and ANSI still blank them. The safety
  checklist had nothing on this, and an agent that runs `carve fmt` over
  untrusted input and treats the output as filtered is the failure it invites.

## Clauses that moved without moving a rule

Fourteen of the sixteen clause entries are PART 12 interchange prose: the 0.2
condensation pass, the new AST fallback matrix, and the `destination-denied`
render-loss row. Checked against `references/`: the skill teaches no
interchange-only shape, so none of them has a prose home here.

Two of the sixteen did not change at all. The clause bodies of
`AN EXTENDED TASK STATE NAMES ITSELF ON THE ITEM` and
`CAPTION NUMBER PLACEHOLDER` are byte-identical across the two revisions; their
fingerprints moved because a clause extent runs to the next clause heading and a
neighbor gained text. That is the fingerprint being coarse, not a ruling.

## Status notes re-checked

Every version-dated note in `references/` was re-read against this pin. The
engine did not move, so the ones about released behavior (`0.1.5` arrows,
`fence-opener-fallback`, the placement diagnostics, `table-alignment-run-padding`,
`definition-term-block-folded`, the Markdown heading-id export, `pos.file`) keep
their premises. The one expired premise was the syntax card's container-title
claim: it described a spec rule that 1acc54cf replaced, with no note saying the
engine was the source of it.
