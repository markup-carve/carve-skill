// Drift guard: the skill's syntax card and trap list must not silently diverge
// from the canonical spec docs (vendored as the `spec` submodule). If the spec
// adds a divergence or changes an essential construct token, this fails until
// the skill is updated — no hand-maintained second copy that rots unnoticed.

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  sectionFingerprints,
  compareSections,
  describeFindings,
} from '../scripts/spec-sections.mjs'
import { shortfall } from '../scripts/participants.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)

const specDivergence = join(root, 'spec', 'docs', 'divergence-from-djot.md')
const specCheatsheet = join(root, 'spec', 'docs', 'cheatsheet.md')

const skillText = [
  'SKILL.md',
  'references/syntax.md',
  'references/traps.md',
  'references/extensions.md',
  'references/validation.md',
].map((f) => readFileSync(join(root, f), 'utf8')).join('\n')

const traps = readFileSync(join(root, 'references', 'traps.md'), 'utf8')

test('spec submodule is checked out', () => {
  assert.ok(
    existsSync(specDivergence) && existsSync(specCheatsheet),
    'spec/docs not found — run `git submodule update --init`',
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
// So the guard also records WHICH TEXT the trap list was last read against, per
// section. When a pin bump moves a section, this fails and names it; a human
// re-reads that section, fixes references/traps.md if it now lies, and records
// the review with `npm run spec:review`.
test('every divergence section still matches the recorded review', () => {
  const review = JSON.parse(readFileSync(join(here, 'spec-review.json'), 'utf8'))
  const current = sectionFingerprints(readFileSync(specDivergence, 'utf8'))

  assert.ok(
    Object.keys(review.sections).length > 0,
    'test/spec-review.json records no sections — run `npm run spec:review`',
  )

  const findings = compareSections(review.sections, current)
  assert.deepEqual(
    findings,
    [],
    `the pinned spec has moved since the trap list was read against it:\n${describeFindings(findings)}\n\n` +
      'Re-read those sections of spec/docs/divergence-from-djot.md, check the matching\n' +
      'section of references/traps.md still tells the truth, then run `npm run spec:review`.',
  )
})

// Essential constructs that MUST appear in both the spec cheatsheet and the
// skill. Verifying against the cheatsheet keeps this list honest: if the spec
// renames a token, the cheatsheet check fails; if the skill drops it, the skill
// check fails.
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

test('essential constructs are covered by the skill', () => {
  for (const token of ESSENTIAL) {
    assert.ok(
      skillText.includes(token),
      `essential construct ${JSON.stringify(token)} is missing from the skill files.`,
    )
  }
})
