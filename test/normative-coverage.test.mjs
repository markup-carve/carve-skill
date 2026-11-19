import { test } from 'node:test'
import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverageFindings } from '../scripts/normative-coverage.mjs'

// The 0.1 rule registry, clause list and grammar are gone from carve next2; test/skill-02.test.mjs pins the 0.2 sources instead.
const SPEC_0_1 = 'The 0.1 rule registry, clause list and grammar are gone from carve next2; test/skill-02.test.mjs pins the 0.2 sources instead.'

const spec = join(dirname(fileURLToPath(import.meta.url)), '..', 'spec')
const SOURCES = ['resources/spec/rules.json', 'resources/normative-clauses.txt', 'resources/grammar.ebnf']

// A carve checkout after carve#4546: the rule views are built at docs build and
// gitignored, so docs/rules/ does not exist.
function checkoutWithoutViews(gitignore) {
  const dir = mkdtempSync(join(tmpdir(), 'carve-skill-coverage-'))
  for (const path of SOURCES) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    copyFileSync(join(spec, path), join(dir, path))
  }
  if (gitignore !== undefined) writeFileSync(join(dir, '.gitignore'), gitignore)
  return dir
}

test('gitignored rule views that were never built are not a finding', { skip: SPEC_0_1 }, () => {
  const findings = coverageFindings(checkoutWithoutViews('node_modules/\ndocs/rules/\n'))
  assert.deepEqual(findings, [], findings.join('\n'))
})

test('missing rule views the checkout does not ignore are still a finding', { skip: SPEC_0_1 }, () => {
  const findings = coverageFindings(checkoutWithoutViews('node_modules/\n'))
  assert.equal(findings.length, 1)
  assert.match(findings[0], /^docs\/rules: ENOENT/)
})
