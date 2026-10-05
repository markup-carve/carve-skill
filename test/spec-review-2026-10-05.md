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

# Second reading, 2026-10-05

Reviewed `d3ba0205` through `f25fb094`, the head of carve main, four commits of
lag. The open bump pull request targeted `9db47234`; main had moved one commit
further by the time the reading started, so the pin went to `f25fb094` and
`git merge-base --is-ancestor d3ba0205 f25fb094` confirms it only moves
forward. The extra commit over the bump PR's target is a changelog
reconciliation and touches no watched document.

The drift guard named six ledgers: `docs/divergence-from-djot.md` section 1,
`resources/ast-schema.json` nodes `heading_ref` and
`link_reference_definition`, `docs/validation.md` section Rules,
`resources/spec/rules.json` rule `CARVE-P9R-010` as added, and eleven clauses
of `resources/grammar.ebnf`. The cheatsheet, extension guide, extension
contract and security ledgers had no changed entries.

The engine stayed at `@markup-carve/carve` 0.1.9, so every version-dated claim
in `references/` keeps the premise it was measured under.

## What moved

One rule, reaching into every named entry, from carve#2732 with the include
half from carve#2729 and the fragment-link sentence from carve#2731.

- **`resources/spec/rules.json`, `CARVE-P9R-010` NO NAME LOOKUP FOLDS CASE,
  added.** Every place Carve looks a name up now compares case exactly: R1's
  link definitions and heading index, R2's footnote labels, R4's
  cross-references against heading ids and caption ids, and an include's
  `#name`. Trimming, whitespace collapsing and NFC stay; the case fold is
  gone. A reference differing from its target only in case is unresolved, a
  linter SHOULD name the exact spelling, and `carve fmt --migrate` rewrites it
  when exactly one target matches case-insensitively. Ids themselves are
  unchanged, so `{#Tip}` and `{#tip}` stay two ids.
- **`resources/grammar.ebnf`, eleven clauses.** Three carry the rule: R1 drops
  the looser heading-index comparison and states CARVE-P9R-010 in place of it,
  R4 matches heading ids exactly with neither a case nor an ASCII fold, and
  R5a's caption-id keys are matched exactly rather than case-insensitively.
  HEADING IDENTIFIERS and SOCIAL LINK RESOLUTION carry the same change where
  the id table and the include directive are specified; SOCIAL LINK RESOLUTION
  is again the label the ledger gives the include prose, which has no
  normative marker of its own. A CROSSREF REMAINS A HEADING-REFERENCE NODE
  AFTER RESOLUTION, A LINK REFERENCE DEFINITION IS A NODE, A NOTE INSIDE AN
  UNRESOLVED REFERENCE IS NOT A REFERENCE, THE EXPLICIT FORM DOES NOT REACH
  THE INDEX, A QUOTED VALUE STOPS AT THE NEWLINE, AN AUTOLINK DISPLAYS ITS RAW
  SOURCE BODY and THE CLIPBOARD TYPE are the boundary effect: the edits land in
  prose the ledger fingerprints under the preceding marker. Reading each one
  against the diff, none of them states a rule that changed other than through
  the case fold.
- **`resources/grammar.ebnf`, PART 9 section 19 I1a and I5 (inside the same
  clause spans).** `include_section` is now spelled `id_attribute`, so every
  explicit id is nameable including digit-leading ones such as `{#2024-plan}`.
  Explicit ids on any element became ONE namespace, matching HTML's single id
  namespace, so a heading `{#tip}` and a paragraph `{#tip}` collide; footnote
  labels stay separate. Every renamed occurrence now takes its own `-N`
  suffix, the least one no explicit name anywhere in the assembled document
  uses, so a child holding the same id twice yields `-2` and `-3`, and
  references in that child follow the first renamed copy.
- **`docs/divergence-from-djot.md`, section 1.** Retitled from
  "Case-preserving heading ids with case-insensitive cross-references" to
  "Case-preserving heading ids, matched exactly", and rewritten to say Carve
  now agrees with Djot on both counts. The Djot migration step 5 lost the
  sentence that hand-written `</#Anchor>` links work because resolution folds
  case.
- **`docs/validation.md`, section Rules.** `broken-crossref` and
  `unresolved-reference-link` each gained a sentence stating case-sensitive
  matching, that a case-only mismatch names the real id or label, and that
  `carve fmt --migrate` rewrites it when exactly one target matches.
  `broken-fragment-link`, new at the previous pin, gained a sentence saying the
  render that collects the ids is the caller's own with the linter's
  extensions, and that a link absent from that render is not checked.
- **`resources/ast-schema.json`, two nodes.** `heading_ref.target` is now the
  authored spelling kept whether or not it resolves, where it used to be
  described as not necessarily the id it resolved to because ids folded.
  `link_reference_definition`'s label description drops "before case folding"
  for "unnormalized".

## What the skill taught, and what changed

One page taught the old rule and is corrected here.

`references/traps-foundations.md` trap 1 was headed "Heading ids are
case-preserving; cross-references resolve case-insensitively" and said a
`</#getting-started>` or `[Getting Started][]` reference still resolves because
matching is case-insensitive. That is now wrong against the spec, and the
previous reading on this same date is what makes it worth naming: it checked
the same trap against the then-current grammar clause R4, found that R4 did
still fold case, and left the trap alone deliberately. R4 is exactly the clause
carve#2732 rewrote, so that verification expired with it. The apparent
contradiction the earlier review resolved by separating two mechanisms is no
longer a contradiction at all: cross-references and fragment links now answer
to the same rule.

The trap is rewritten to state the exact-match rule once for all five lookups,
to keep the id-shape half unchanged, and to say that there is no ASCII fold
either.

## Ahead of the released engine

The exact-match rule is, and carve says so: `resources/engine-pin-drift.txt`
gained four declarations at this commit, for corpus rows `15-heading-ids-2`,
`173-implicit-heading-references-with-no-definition` and two vectors of the new
`546-every-name-lookup-compares-case-exactly`, each reading that the pin still
folds case.

Verified against the published engine rather than assumed. On
`@markup-carve/carve` 0.1.9, rendering

```
# Getting Started

See </#getting-started>.

See </#Getting-Started>.

See [getting started][].
```

resolves all three to `href="#Getting-Started"` and `carve lint` exits 0 with no
finding. So 0.1.9 still folds case in both the cross-reference table and the
heading index, as the drift file says. The no-ASCII-fold half is NOT ahead of
the engine: `</#cafe-notes>` beside `# Café Notes` already stays literal on
0.1.9, so the trap states that part without a caveat.

The trap therefore teaches the spec rule and carries a measured note that 0.1.9
still folds, in the same shape `references/validation.md` uses for its lint
rows. Writing references case-exact is correct under both engines, which is why
the page tells an author to do that rather than to wait.

## Checked and left alone

- `references/traps-structure-references.md` line 158, the footnote-label
  table, whose row `[^A b] -> literal text (case is not normalized)` already
  taught exact matching. Footnote labels were case-sensitive before
  CARVE-P9R-010 and are the precedent the new rule generalizes, so the row
  needs no change and is now consistent with the rest of the page rather than
  an exception to it.
- `references/syntax.md` line 23, the `</#section-id>` cross-reference row, and
  line 167, the caption rule that says `</#id>` to a captioned block renders
  the number. Both describe what a cross-reference may target, which
  CARVE-P9R-010 does not touch; neither says anything about spelling or case.
- `references/syntax.md` line 204, `{{ chapter.crv#intro @shift:auto }}`, still
  the only include the skill writes. The page says nothing about what `#intro`
  may name or how it is matched, so widening the selector to every explicit id
  and tightening its comparison leave no stale claim. The gap the previous
  reading recorded, that the skill has no include topic, is unchanged and still
  a scope decision rather than a correction.
- `references/validation.md` line 44, the default-mode list naming "broken
  `</#id>` cross-references", and line 147, which cites `broken-crossref` as a
  rule `lintCarve` carries. Neither transcribes the spec table's wording, so
  the two new sentences do not reach them. The standing caveat at line 118,
  that the spec's lint table runs ahead of the released engine, now covers the
  case-only findings too and needed no edit to do so.
- `references/validation.md` lines 84 and 99 and
  `references/workflows.md` line 115, the version-dated claims that name 0.1.9.
  The engine did not move at this pin, so their premise holds.
- Every page for `heading_ref` and `link_reference_definition`: the skill names
  no AST node type anywhere, so the two schema descriptions have no reader
  here. Searched `references/`, `SKILL.md` and `agents/` for both names and for
  `heading_ref` alone; no hit.
- `references/quality-and-safety.md`, the untrusted-input advice on includes.
  Per-occurrence rename suffixes change which id an expanded document
  publishes, not what it reads, so the advice is unaffected.
- `references/traps-migration.md` and the rest of
  `references/traps-foundations.md`: searched every page for `case`,
  `case-insensitive`, `fold` and `lowercase`. Outside trap 1 the only hits are
  the footnote row above, the `lowercaseHeadingIds` opt-in mention inside trap
  1 itself, and three uses of the English word "case" in unrelated prose.

## Left open

Nothing. No change here raises a question the spec leaves unanswered.
