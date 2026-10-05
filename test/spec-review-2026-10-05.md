# Spec review, 2026-10-05

Reviewed `e60b7847` through `d3ba0205`, a commit on carve main, six commits of
lag. The open bump pull request already targeted `d3ba0205`, so the pin went
where it pointed.

The drift guard named one `docs/validation.md` section and one grammar clause.
The divergence, cheatsheet, AST schema, extension guide, extension contract,
security and rules ledgers had no changed entries.

The engine stayed at `@markup-carve/carve` 0.1.9, so every version-dated claim
in `references/` keeps the premise it was measured under.

## What moved

Two changes, unrelated to each other.

- `docs/validation.md`, section Rules. The lint rule table gained
  `broken-fragment-link`: a `[text](#id)` link, inline or through a
  `[label]: #id` definition, whose fragment matches no id in the rendered
  document, matched case-sensitively like the rendered `href`. In the same row
  group `broken-crossref` grew a second clause, that when the id exists on
  another element the message names that element and suggests `[text](#id)`,
  because a cross-reference cannot target it.
- `resources/grammar.ebnf`, clause SOCIAL LINK RESOLUTION. The label is an
  artifact of how the ledger bounds a clause body, which runs from one
  normative marker to the next: the include directive's prose carries no
  marker of its own, so it is fingerprinted under the preceding clause. What
  actually changed is include fragment selection. A new I1a says a `#name`
  selector resolves in two steps, a heading whose id is `name` selecting its
  section, otherwise a block carrying that explicit id selecting exactly that
  block, with ids on inlines, list items, table cells and definitions
  selecting nothing. I1 lost the sentence that spelled `#section` as a heading
  subtree, and I7 added a `#name` that selects nothing to the error list.

## Reference changes

None, and the reasons differ per change.

The two validation-table entries are both ahead of the pinned engine. The
spec commit says so for `broken-fragment-link`, which it declares in
`NOT_IN_THE_PIN_YET`, and the released engine confirms the pair. Measured on
`@markup-carve/carve` 0.1.9, linting

```
# A

see [x](#nope) and </#nope>
```

reports `broken-crossref` for the cross-reference in its old short wording and
nothing at all for the fragment link. `references/validation.md` already
carries the standing caveat that the spec's lint table includes rules ahead of
the released engine, with `table-alignment-run-padding` and
`fence-title-syntax` as its worked examples, so a reader is told not to expect
every table row from 0.1.9. Teaching either new behavior now would describe an
engine nobody can install.

Checked and left alone:

- `references/validation.md` line 44, the default-mode list, which names
  "broken `</#id>` cross-references" among the constructs the default profile
  catches. It is a list of what default mode covers, not a transcription of
  the spec's table, and the entry it names still holds.
- `references/validation.md` line 147, which cites `broken-crossref` as an
  example of a semantic rule that `lintCarve` carries rather than
  `djotMigrationWarnings`. The rule's home did not move.
- `references/traps-foundations.md` trap 1, which states that a `</#id>`
  cross-reference folds case-insensitively against case-preserved heading ids.
  The new table row states case-SENSITIVE matching, which looks like a
  contradiction and is not: that sentence governs `[text](#id)` fragment
  links, which match the rendered `href`, while cross-references keep their
  own regime. Grammar clause R4 at `d3ba0205` still reads "folds
  case-insensitively and matches against the case-preserved headingIds", so
  the trap keeps its rule.
- `references/syntax.md` line 23 and line 167, the cross-reference row and the
  caption rule. Both describe what `</#id>` may target, headings and numbered
  captions, which I1a does not touch and the `broken-crossref` message change
  reaffirms.
- `references/syntax.md` line 204, the only place the skill writes an include,
  `{{ chapter.crv#intro @shift:auto }}` in the cheat sample, with the
  surrounding note that core never expands one. The skill nowhere says what
  `#intro` is allowed to name, so I1a widening it from a heading section to
  any explicitly-identified block leaves no stale claim behind. There was no
  old reading to correct.
- `references/quality-and-safety.md` line 28, which tells an agent to leave
  includes disabled for untrusted input. I1a adds a selector target, not a
  new read surface, and I7 makes a failed selection an error rather than a
  silent expansion, so the advice is unaffected.

Worth noting rather than acting on: block-level include selection is
authorable source, so it is in principle the skill's subject. The skill has no
include topic to extend, only the one cheat-sheet line, so adding it is a
scope decision rather than a correction. This review records the gap instead
of filling it, the same call the 2026-10-04 review made about pipe-table row
grouping.
