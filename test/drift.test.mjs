// Drift guard: the skill's syntax card and trap list must not silently diverge
// from the canonical spec docs (vendored as the `spec` submodule). If the spec
// adds a divergence or changes an essential construct token, this fails until
// the skill is updated — no hand-maintained second copy that rots unnoticed.

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  sectionFingerprints,
  compareSections,
  describeFindings,
} from '../scripts/spec-sections.mjs'
import { LEDGERS, specRoot } from '../scripts/review-ledgers.mjs'
import { parseRows, rowFingerprints, splitRow } from '../scripts/cheatsheet-rows.mjs'
import { ruleFingerprints } from '../scripts/normative-rules.mjs'
import { shortfall } from '../scripts/participants.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)

const specDivergence = join(root, 'spec', 'docs', 'divergence-from-djot.md')
const specCheatsheet = join(root, 'spec', 'docs', 'cheatsheet.md')
const specRules = join(root, 'spec', 'resources', 'spec', 'rules.json')
const specClauses = join(root, 'spec', 'resources', 'normative-clauses.txt')
const specRuleViews = join(root, 'spec', 'docs', 'rules')

const traps = readFileSync(join(root, 'references', 'traps.md'), 'utf8')

test('spec submodule is checked out', () => {
  const watched = LEDGERS.map((ledger) => join(specRoot(root), ledger.source))
  const absent = watched.filter((path) => !existsSync(path))
  assert.deepEqual(
    absent,
    [],
    'watched spec document(s) not found — run `git submodule update --init`',
  )
})

test('trap list covers every divergence section in the spec', () => {
  const spec = readFileSync(specDivergence, 'utf8')
  // Numbered divergence sections, e.g. "## 1." … "## 9." (allow a "1b" suffix).
  //
  // Read through sectionFingerprints rather than through a second regex of its
  // own. scripts/spec-sections.mjs opens by calling itself "one spelling of what
  // is a divergence section", and this test used to carry a slightly different
  // second one - `/^## (\d+)[a-z]?\. /gm`, capturing without the letter suffix.
  // Two spellings of one rule is the defect markup-carve/carve#755 keeps
  // recording, and the failure mode here is silent: a spec heading form that the
  // shared parser accepts and the local copy does not leaves `specNums` empty,
  // and an empty list makes the assertion below trivially true. Measured -
  // rewrite the spec's headings and this test passes with references/traps.md
  // COMPLETELY EMPTY.
  const specNums = [...new Set(
    Object.keys(sectionFingerprints(spec)).map((label) => label.replace(/[a-z]$/, '')),
  )].sort((a, b) => a - b)

  const thin = shortfall({
    label: 'DIVERGENCES',
    actual: specNums.length,
    atLeast: 10,
    of: 'numbered section(s) in spec/docs/divergence-from-djot.md',
    hint: 'the coverage claim below is about this list; over an empty one it ' +
      'holds no matter what references/traps.md says.',
  })
  assert.equal(thin, null, thin ?? '')

  const trapNums = new Set(
    [...traps.matchAll(/^## (\d+)\. /gm)].map((m) => m[1]),
  )
  // The trap list must COVER every spec divergence (superset allowed): it may
  // document a divergence ahead of the spec doc catching up (e.g. definition
  // lists, spec PR #266). If the spec adds a new numbered divergence, this
  // fails until references/traps.md covers it.
  const missing = specNums.filter((n) => !trapNums.has(n))
  assert.deepEqual(
    missing,
    [],
    `references/traps.md is missing spec divergence section(s) ${missing.join(', ')}. ` +
      'Update it after bumping the spec submodule.',
  )
})

// Section NUMBERS are not the divergence. carve#455 inverted the entire
// container rule inside section 13 - equal-length fences went from "the inner
// opener is text" to "they nest", an unclosed opener went from "stays a
// paragraph" to "closes at end of input" - and left the heading numbered 13
// throughout. The coverage test above passes on both texts, and passed across
// the pin bump that carried the change in (#6), while references/traps.md
// section 13 kept describing the pre-455 rule.
//
// So the guard also records WHICH TEXT the skill was last read against, per
// entry. When a pin bump moves one, this fails and names it; a human re-reads
// it, fixes the reference page if it now lies, and records the review with
// `npm run spec:review`.
//
// One arm per watched document, driven by scripts/review-ledgers.mjs rather than
// by a path spelled here. Spelling the paths here is what left
// resources/ast-schema.json unwatched: the schema states language rules in prose
// - block promotion, resolution timing, which fields survive a round trip - and
// pin be6e7cc6 -> cc06bb5 rewrote the `image` node's block-position rule with
// every gate in this repository green (markup-carve/carve-skill#84).
for (const ledger of LEDGERS) {
  test(`every ${ledger.kind} of ${ledger.source} still matches the recorded review`, () => {
    const recorded = JSON.parse(readFileSync(join(here, ledger.reviewFile), 'utf8'))[
      ledger.entries
    ]
    const current = ledger.fingerprint(
      readFileSync(join(specRoot(root), ledger.source), 'utf8'),
    )

    // Both halves have to be counted. An empty RECORDED ledger compares clean
    // against anything, and an empty CURRENT one reports every entry as removed
    // only because the recorded side happened to be full - neither is a pass
    // (markup-carve/carve#755).
    for (const [side, entries] of [['recorded', recorded], ['current', current]]) {
      const thin = shortfall({
        label: `${ledger.label} (${side})`,
        actual: Object.keys(entries ?? {}).length,
        atLeast: ledger.atLeast,
        of: `${ledger.of} in ${side === 'recorded' ? `test/${ledger.reviewFile}` : `spec/${ledger.source}`}`,
        hint: side === 'recorded'
          ? 'the ledger is missing or empty — run `npm run spec:review`.'
          : ledger.hint,
      })
      assert.equal(thin, null, thin ?? '')
    }

    const findings = compareSections(recorded, current)
    assert.deepEqual(
      findings,
      [],
      `the pinned spec has moved since the skill was read against it:\n` +
        `${describeFindings(findings, ledger.kind)}\n\n${ledger.reread}`,
    )
  })
}

// The cheat-sheet ledger above only reports on the rows it parsed, so what it
// does NOT parse is invisible to it - the same blind spot as a guard that names
// its documents, one level down. scripts/cheatsheet-rows.mjs therefore claims a
// TOTAL parse: every line of the card lands in exactly one entry. This is that
// claim, checked, rather than a comment asserting it.
//
// Without this, a spec revision that introduced a construct in a shape the
// parser skips - an HTML table, a definition list, an indented block - would
// leave those lines fingerprinted by nothing and the ledger would still report
// all 63 entries matching.
test('every line of the cheat sheet belongs to exactly one ledger row', () => {
  const lines = readFileSync(specCheatsheet, 'utf8').replace(/\r\n/g, '\n').split('\n')
  const rows = parseRows(lines.join('\n'))

  const covered = new Map()
  for (const row of rows) {
    for (const index of row.lines) covered.set(index, (covered.get(index) ?? 0) + 1)
  }

  // A blank line carries nothing and is allowed to fall between entries; a line
  // with content is not.
  const uncovered = []
  const doubled = []
  lines.forEach((line, index) => {
    const times = covered.get(index) ?? 0
    if (times > 1) doubled.push(`${index + 1}: ${line}`)
    else if (times === 0 && line.trim() !== '') uncovered.push(`${index + 1}: ${line}`)
  })

  assert.deepEqual(
    uncovered,
    [],
    'line(s) of spec/docs/cheatsheet.md are fingerprinted by no ledger row, so the spec\n' +
      'can rewrite them with the guard green. Teach scripts/cheatsheet-rows.mjs the shape\n' +
      'they are written in, then run `npm run spec:review`.',
  )
  assert.deepEqual(
    doubled,
    [],
    'line(s) of spec/docs/cheatsheet.md land in two ledger rows, so one edit reports as two\n' +
      'findings and the row labels no longer name a place in the document.',
  )
})

// THE NORMATIVE RULE SURFACE IS THREE FILES AND ONE LEDGER, AND THAT IS A
// MEASUREMENT, NOT AN ASSUMPTION.
//
// The rules ledger watches resources/spec/rules.json alone. Two documents make
// that sufficient rather than partial: resources/normative-clauses.txt is the
// registry's title set, generated from the grammar, and docs/rules/ is generated
// from the registry. A second ledger over either would be a second spelling of
// one rule, which is the defect markup-carve/carve#755 keeps recording - so the
// sufficiency is asserted here instead, and stops being true out loud if the
// spec ever lets those surfaces diverge.

test('the clause inventory and the rules registry hold the same clauses', () => {
  const registry = JSON.parse(readFileSync(specRules, 'utf8'))
  const inventory = readFileSync(specClauses, 'utf8')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'))
    .map((line) => /^(\d+)\s+(.+)$/.exec(line.trimEnd()))

  const malformed = inventory.filter((match) => match === null).length
  assert.equal(
    malformed,
    0,
    `${malformed} line(s) of spec/resources/normative-clauses.txt are not "<count> TITLE" - ` +
      'the inventory changed shape, and the comparison below no longer reads it.',
  )

  // A multiset, not a set: three titles are carried by two clauses each, in
  // different PARTs, and the inventory states that in its count column.
  const tally = (pairs) => {
    const counts = new Map()
    for (const [title, times] of pairs) counts.set(title, (counts.get(title) ?? 0) + times)
    return [...counts].sort(([a], [b]) => a.localeCompare(b))
  }
  const claimed = tally(inventory.map((match) => [match[2].trim(), Number(match[1])]))
  const held = tally(registry.rules.map((rule) => [rule.title, 1]))

  const thin = shortfall({
    label: 'CLAUSE INVENTORY',
    actual: claimed.length,
    atLeast: 200,
    of: 'clause heading(s) in spec/resources/normative-clauses.txt',
    hint: 'the inventory is missing or truncated - over an empty list the equality below ' +
      'says nothing about what the registry watches.',
  })
  assert.equal(thin, null, thin ?? '')

  assert.deepEqual(
    claimed,
    held,
    'spec/resources/normative-clauses.txt and spec/resources/spec/rules.json no longer hold\n' +
      'the same clauses, so watching the registry no longer watches the inventory. Give the\n' +
      'inventory its own ledger in scripts/review-ledgers.mjs.',
  )
})

test('the generated rule views and the rules registry hold the same rule ids', () => {
  const registry = JSON.parse(readFileSync(specRules, 'utf8'))
  const active = registry.rules.map((rule) => rule.id).sort()
  const known = new Set([...active, ...(registry.retired ?? []).map((rule) => rule.id)])

  const views = readdirSync(specRuleViews).filter((name) => name.endsWith('.md'))
  assert.ok(views.length >= 5, `spec/docs/rules/ holds ${views.length} view(s), expected at least 5`)

  const seen = new Set()
  const unknown = []
  for (const view of views) {
    const text = readFileSync(join(specRuleViews, view), 'utf8')
    for (const match of text.matchAll(/`(CARVE-[A-Z0-9]+-\d{3})`/g)) {
      seen.add(match[1])
      if (!known.has(match[1])) unknown.push(`${view}: ${match[1]}`)
    }
  }

  const thin = shortfall({
    label: 'RULE VIEWS',
    actual: seen.size,
    atLeast: 200,
    of: 'rule id(s) cited across spec/docs/rules/',
    hint: 'the views are missing, truncated, or no longer cite rule ids in code spans.',
  })
  assert.equal(thin, null, thin ?? '')

  // Both directions. An id the registry does not carry means the views are no
  // longer generated from it; an active id no VIEW carries means the same thing
  // from the other side, and a floor cannot see either - the index claims the
  // views cover all active rules exactly once.
  assert.deepEqual(
    unknown,
    [],
    'spec/docs/rules/ cites rule id(s) the registry does not carry, so the views are no\n' +
      'longer generated from spec/resources/spec/rules.json and the rules ledger does not\n' +
      'watch them. Give them their own ledger in scripts/review-ledgers.mjs.',
  )
  assert.deepEqual(
    active.filter((id) => !seen.has(id)),
    [],
    'active rule id(s) appear in spec/resources/spec/rules.json but in no view under\n' +
      'spec/docs/rules/, so the views no longer present the whole registry and reading the\n' +
      'registry is no longer reading them.',
  )
})

// What the rules ledger is sensitive to is the whole design of it: too little
// and a rewritten clause passes, too much and every pin bump reports 249
// findings and gets recorded without being read. Pinned here rather than
// described in a comment.
test('rule fingerprints follow rule identity, not registry presentation', () => {
  const registry = (rules) => JSON.stringify({ version: 1, scopes: [], rules, retired: [] })
  const first = { id: 'CARVE-P0-001', part: '0', title: 'ONE RULE', scope: 'parsing' }
  const second = { id: 'CARVE-P2-001', part: '2', title: 'ANOTHER RULE', scope: 'parsing' }
  const base = ruleFingerprints(registry([first, second]))

  assert.deepEqual(
    ruleFingerprints(registry([second, first])),
    base,
    'reordering the registry is presentation - it must not demand a re-review of every rule',
  )
  assert.deepEqual(
    ruleFingerprints(registry([{ ...first, scope: 'canonical-writing' }, second])),
    base,
    'the scopes are navigation views, and hashing them made one metadata addition read as ' +
      '242 moved rules',
  )

  const sha = (doc) => ruleFingerprints(doc)['CARVE-P0-001'].sha256
  assert.notEqual(
    sha(registry([{ ...first, title: 'ONE RULE, RESTATED' }, second])),
    base['CARVE-P0-001'].sha256,
    'a retitled clause is a changed clause - that is what a reader has to re-read',
  )
  assert.notEqual(
    sha(registry([{ ...first, part: '9' }, second])),
    base['CARVE-P0-001'].sha256,
    'a clause that moved to another PART moved in the grammar, not in a view',
  )

  assert.throws(
    () => ruleFingerprints(registry([first, { ...second, id: first.id }])),
    /twice/,
    'two rules under one id would leave one of them invisible to the ledger',
  )
  assert.throws(
    () => ruleFingerprints(registry([{ part: '0', title: 'NO ID' }])),
    /no id/,
    'a rule the parser cannot key would be dropped silently',
  )
  assert.throws(
    () => ruleFingerprints(JSON.stringify({ version: 1 })),
    /`rules` array/,
    'a registry with no rules array is a restructured document, not an empty one',
  )
})

// Normalizing a row is what keeps the ledger from demanding a re-review over a
// re-padded column, and it is also the one place the ledger can be made blind
// again by accident: collapse a blank run INSIDE a code span and the card can
// change the sample it teaches with the fingerprint unmoved. In Carve the width
// of a run is routinely the whole rule - `1. ` puts the content column at 3 and
// `1.  ` does not - so the two kinds of blank are pinned apart here.
test('row normalization collapses layout and preserves samples', () => {
  assert.deepEqual(splitRow('|  a   b |   c |'), ['a b', 'c'])
  assert.deepEqual(splitRow('| `1.  x` | ordered |'), ['`1.  x`', 'ordered'])
  assert.deepEqual(splitRow('| `` `a|b` `` | a pipe inside a span |'), [
    '`` `a|b` ``',
    'a pipe inside a span',
  ])

  const card = (sample) => `## Inline\n\n| Write | Get |\n|---|---|\n| ${sample} | ordered |\n`
  const tight = rowFingerprints(card('`1. x`'))
  const wide = rowFingerprints(card('`1.  x`'))
  assert.notEqual(
    Object.values(tight).at(-1).sha256,
    Object.values(wide).at(-1).sha256,
    'a blank run inside a code span is the sample, not layout - collapsing it lets the ' +
      'card teach a different content column with the ledger green',
  )

  const padded = rowFingerprints(card('`1. x`').replace('| ordered |', '|   ordered   |'))
  assert.deepEqual(
    Object.values(padded).map((entry) => entry.sha256),
    Object.values(tight).map((entry) => entry.sha256),
    'padding outside a code span is layout - re-padding a column must not demand a re-review',
  )
})

// Essential constructs that MUST appear in both the spec cheatsheet and the
// skill. Verifying against the cheatsheet keeps this list honest: if the spec
// renames a token, the cheatsheet check fails; if the skill drops it, the skill
// check fails.
//
// PRESENCE is all this proves, and presence is not meaning. It was the only
// thing this repository ever asked of the cheat sheet, so a row could keep its
// token while its Get and Mnemonic columns were rewritten into the opposite
// rule and every gate stayed green (#89). What closes that is the per-row
// ledger above, not a longer token list here: this test answers "is the
// construct still called that", and the ledger answers "does the row still say
// what references/syntax.md was written from".
const ESSENTIAL = [
  '/italic/',
  '*bold*',
  '_underline_',
  '~strike~',
  '{^super^}',
  '{,sub,}',
  '=highlight=',
  '</#',
  '^[',
  ':: ',
  '%%',
  '```=',
  '::: ',
]

test('essential constructs are present in the spec cheatsheet', () => {
  const cheat = readFileSync(specCheatsheet, 'utf8')
  for (const token of ESSENTIAL) {
    assert.ok(
      cheat.includes(token),
      `essential construct ${JSON.stringify(token)} is no longer in the spec cheatsheet — ` +
        'the spec changed; update ESSENTIAL and the skill together.',
    )
  }
})

// The pages held to the FULL construct list, and the criterion for being one.
//
// A REFERENCE page is a page that claims to enumerate the core syntax, so a
// construct absent from it is a hole in what the skill teaches rather than a
// paraphrase. Exactly one page in this repository makes that claim:
// references/syntax.md opens with "The whole core syntax" and "Sourced from the
// spec's `docs/cheatsheet.md`" - the same document ESSENTIAL is checked against
// in the test above. The other references are topic pages (traps.md is the
// divergence list, extensions.md is Tier-2/3, validation.md is the linter, and
// quality-and-safety.md is a checklist)
// and none of them undertakes to name every core construct.
//
// SKILL.md is deliberately NOT on this list. It is a front page that paraphrases
// on purpose, and ESSENTIAL holds the cheatsheet's literal spelling: measured,
// SKILL.md writes `{^sup^}` and `{^text^}` and never the cheatsheet's
// `{^super^}`, so holding it to these tokens would be satisfied only by padding
// it with a spelling it does not use.
const REFERENCE_PAGES = ['references/syntax.md']

// This replaces a union over all five skill files concatenated, which could
// only fail once a construct had left EVERY page. Measured on that shape:
// replacing `{,sub,}` with `{,subscript,}` in references/syntax.md alone - the
// page that teaches the delimiter - was a complete no-op, 13 passing and 0
// failing, because SKILL.md and references/traps.md still mentioned it
// (markup-carve/carve-skill#61).
//
// The union is removed rather than narrowed. Once the reference page is held to
// the full list it can no longer fail, since the reference page is part of the
// concatenation - a check that cannot fail is the defect this is fixing, not a
// second opinion on it.
test('the syntax reference carries every essential construct', () => {
  for (const page of REFERENCE_PAGES) {
    const text = readFileSync(join(root, page), 'utf8')
    for (const token of ESSENTIAL) {
      assert.ok(
        text.includes(token),
        `essential construct ${JSON.stringify(token)} is missing from ${page}, ` +
          'the page that teaches the core constructs. A mention on another page ' +
          'does not stand in for it.',
      )
    }
  }
})
