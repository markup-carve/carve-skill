# Spec review, 2026-10-06

Reviewed `f25fb094` through `71caf585`, the head of carve main, three commits
of lag. The open bump pull request targeted `8b68a460`; main had moved one
commit further by the time the reading started, so the pin went to `71caf585`.
`git merge-base --is-ancestor f25fb094 71caf585` and
`git merge-base --is-ancestor 8b68a460 71caf585` both hold, so the pin only
moves forward and the pull request's own target is contained in it.

The drift guard named three watched documents: five sections of
`docs/extension-contract.md`, two sections of `docs/validation.md`, and one
clause of `resources/grammar.ebnf`. Clean at this pin:
`docs/divergence-from-djot.md` (23 sections), `docs/cheatsheet.md` (63 rows),
`resources/ast-schema.json` (73 nodes), `docs/extensions.md` (8 sections),
`docs/security.md` (16 sections) and `resources/spec/rules.json` (307 rules).
The normative rule surface check passed: the clause inventory, the grammar and
the generated views all agree with the registry.

The engine stayed at `@markup-carve/carve` 0.1.9, so every version-dated claim
in `references/` keeps the premise it was measured under.

## What moved

Three changes, from carve#2739 and carve#2740.

- **`docs/extension-contract.md` sections 7.2, 7.3 and 12.2.** Glossary term
  matching became a name lookup. Section 7.2 was retitled from Slug to Id and
  matching: a term's id is now `gloss-{slug}` of the term's plain text with
  case PRESERVED and ASCII folding off, so `:: HTTP` gets `gloss-HTTP` where it
  used to get `gloss-http`. `:term[word]` compares EXACTLY under
  `CARVE-P9R-010`, with trimming, whitespace collapsing and NFC but no case
  fold, so `:term[HTTP]` finds `:: HTTP` and `:term[http]` does not. Section
  7.3 follows: a marker renders a link with the slug of the first term it
  matches, and a case-only mismatch degrades to `<span class="term">`. Section
  12.2 states the same rule for HeadingReference, so `[[getting started]]`
  does not find `# Getting Started`.
- **`docs/extension-contract.md` section 8.2.** The opposite ruling for the
  index, written out so the two are no longer ambiguous. An `:index[term]`
  marker's slug keeps lowercasing on and ASCII folding off, which means
  `:index[Carve]` and `:index[carve]` share a slug and make ONE entry. The
  section says in as many words that this is grouping, not a name lookup, so
  `CARVE-P9R-010` does not apply to it.
- **`docs/validation.md`, sections Rules and Which implementations provide
  these rules.** `unresolved-reference-link` now also covers a reference image,
  `![alt][label]` or `![alt][]`, with no matching definition. The
  implementations paragraph gained the matching caveat: none of the surveyed
  builds reports the rule for a reference image yet.
- **`resources/grammar.ebnf`, clause ABSORPTION REACHES A PARAGRAPH'S OWN
  LINES ONLY.** The clause's own normative text did not change. The ledger
  bounds a clause body from one normative marker to the next, and the edit
  landed in the admonition tier prose further down that span, which carries no
  marker of its own. What actually changed there: a `:::` container type is a
  keyword and matches exactly, so `::: Note` is not the `note` admonition but
  the Tier-2 `<div class="Note">`. Absorption, the clause the label names, is
  untouched.

## Reference changes

None, and the reasons differ per change.

**Glossary, index and wikilink matching.** The skill does not teach any of
these three constructs' semantics, only that they exist.
`references/extensions.md` line 19 lists `::: glossary`, `:index[term]` and
`::: index` in the feature-to-tier table; line 34 says `::: glossary` and
`::: index` are placeable at any depth; line 49 says `glossary` places a `<dl>`
and `index` a `<ul>`, so a title and a label precede the generated content
rather than sitting inside it. None of those is a claim about ids, slugs or
matching. Searched `SKILL.md`, `references/`, `agents/` and `examples/` for
`:term`, `gloss`, `slug` and `[[`: the `slug` hits are GFM slugs in
`references/workflows.md` lines 110 and 118, the ASCII-folding note in
`references/traps-blocks-containers.md` line 80 and the digit-leading
generated-id note in `references/traps-structure-references.md` line 59, all
about HEADING ids, which these sections do not touch. There is no `:term`
occurrence anywhere and no wikilink occurrence anywhere, so §12.2 has no reader
in this repo at all.

Measured rather than assumed, because a rule the skill might teach has to hold
on the engine an agent will run. On `@markup-carve/carve` 0.1.9, rendering

```
:term[HTTP] and :term[http]

::: glossary
:: HTTP
  Hypertext Transfer Protocol
:::

[[Getting Started]] and [[getting started]]

# Getting Started
```

gives `<span class="ext-term">HTTP</span>` and `<span class="ext-term">http</span>`
for the two markers, an undifferentiated `<dl>` with no `gloss-` id on the
entry, and literal `[[Getting Started]]` text for both wikilinks. So the
published default render carries neither the glossary id scheme nor wikilinks,
and there is no engine against which an author could check a rule about either.
Teaching the exact-match semantics now would describe behavior nobody can
observe, for constructs the skill does not otherwise cover.

**The reference-image lint row.** `references/validation.md` names the
rule only in prose, line 44's default-mode list, as "unresolved reference
links" among the constructs the default profile catches. It transcribes no
scope, so widening the rule to reference images leaves no stale claim.
Verified on 0.1.9: linting

```
see ![alt][nope] and [text][nope2]
```

reports `unresolved-reference-link` at column 22 for the text reference link
and nothing for the reference image, exits `1`. That is exactly what the
spec's implementations paragraph now says, so the new row half is ahead of
every build and the standing caveat at `references/validation.md` line 118,
that the spec's lint table runs ahead of the released engine, already covers
it.

**The admonition keyword clause.** `references/syntax.md` line 129 already
states the behavior by its letter: the eight canonical types are listed, and
"Any other word" renders `<div class="word">`. `::: Note` is any other word, so
the page is correct as written. Measured on 0.1.9 to be sure the spec clause is
not ahead of the engine: `::: note` renders
`<aside class="admonition note" aria-label="Note">`, `::: Note` renders
`<div class="Note">` and `::: NOTE` renders `<div class="NOTE">`, so the engine
already matches the type as a keyword.

Spelling the trap out explicitly was drafted and then dropped on a measured
budget rather than a judgement call. `references/syntax.md` is the routed
reference for the routine profile, whose published total is 2489 GPT-5 tokens
against a task-eval cap of 2500 in `test/task-evals.json`: eleven tokens of
headroom. The shortest honest sentence cost 48, which failed both
`published progressive-disclosure profiles stay exact` and the emphasis task
eval's `contextBudget`. A restatement of a rule the page already implies is
not worth raising a measured budget for, and `test/behavior.json` carries no
case that would have caught the misreading. Recorded here instead.

## Checked and left alone

- `references/syntax.md` line 129, the container type list, per the measurement
  above. Correct as written for the new clause.
- `references/syntax.md` lines 24 and 171, the only two places the skill writes
  an image. Both are the inline form, `![alt](img.jpg)` in the construct table
  and `![A sunset](sun.jpg)` in the caption sample. The skill never writes the
  reference form `![alt][label]`, so the widened lint row has nothing to
  correct and the `examples/` showcase needs no new case.
- `references/validation.md` line 44, the default-mode list, and line 118, the
  standing ahead-of-the-engine caveat. Neither transcribes the spec table's
  wording; the caveat covers the new row half without an edit.
- `references/traps-blocks-containers.md` line 58, the list-item content-column
  rule, which is the nearest thing in the skill to the clause the ledger named.
  It governs whether a block below an item's content column detaches to
  document level or lazily continues the paragraph, and says the `+`
  continuation marker still attaches a flush-left block. The absorption clause
  governs which lines a paragraph may absorb inside a container prefix and did
  not change, so the trap keeps its rule.
- The flush-left-under-a-nested-list-item family specifically. Searched
  `SKILL.md`, `references/` and `examples/` for `flush-left` and `flush left`:
  three hits, `references/syntax.md` lines 62 and 87 and
  `references/traps-foundations.md` line 22, all about the `+` continuation
  marker attaching the next flush-left block, plus the trap above. The skill
  teaches no split for a flush-left line under a nested list item, which is the
  right state: the clause written for carve#2734 was withdrawn after
  measurement, so the spec says nothing about that family and neither should
  this repo.
- `references/traps-foundations.md` line 14, the `CARVE-P9R-010` enumeration of
  what compares case exactly. It lists cross-references, `[text][label]`
  labels, a collapsed `[Heading][]`, footnote labels and an include's `#name`.
  Sections 7.2 and 12.2 add `:term[word]` and `[[Heading]]` to that family, so
  the list is now short by two members, and section 8.2 adds the one carve-out
  that a reader generalizing from it would get wrong. Left as is on the same
  grounds as the glossary reading: both new members are opt-in constructs the
  skill does not cover and neither is observable on 0.1.9, and
  `references/traps-foundations.md` is the routed reference for the
  foundations profile. A reader of the trap is told what the rule covers among
  the constructs this skill teaches, and every one of those five is still
  listed correctly.
- `references/extensions.md` lines 6, 19, 34 and 49, the glossary and index
  entries. Tier assignment, placement depth and the `<dl>`/`<ul>` title
  carve-out are all unchanged by sections 7.2, 7.3 and 8.2.
- `references/quality-and-safety.md`. Neither change adds a read surface or an
  escaping question, so the untrusted-input advice is unaffected.
- `resources/lint-default-triggers.json` gained a `broken-fragment-link`
  trigger at this pin. No ledger watches that file and no skill page claims
  which rules the default profile triggers by id, so there is nothing to
  record beyond naming it.

## Left open

Two gaps, both recorded rather than filled, and both scope decisions:

- The skill has no wikilink coverage at all, so §12.2 is unread here. That is
  the same shape as the include gap the 2026-10-05 reading recorded.
- `references/traps-foundations.md` trap 1 is two members short of the spec's
  name-lookup family and does not carry the index carve-out. Filling it needs
  either budget headroom or a decision to cover the Tier-2 and Tier-3
  constructs involved.
