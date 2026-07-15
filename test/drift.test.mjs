// Drift guard: the skill's syntax card and trap list must not silently diverge
// from the canonical spec docs (vendored as the `spec` submodule). If the spec
// adds a divergence or changes an essential construct token, this fails until
// the skill is updated — no hand-maintained second copy that rots unnoticed.

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
  const specNums = [...new Set(
    [...spec.matchAll(/^## (\d+)[a-z]?\. /gm)].map((m) => m[1]),
  )].sort((a, b) => a - b)
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
