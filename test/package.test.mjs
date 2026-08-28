import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEDGERS } from '../scripts/review-ledgers.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const shipped = ['SKILL.md', ...JSON.parse(readFileSync(join(root, 'package.json'))).files]

test('every local Markdown link in shipped documentation resolves', () => {
  const documents = [
    'SKILL.md', 'README.md',
    ...['syntax.md', 'traps.md', 'extensions.md', 'validation.md', 'workflows.md',
      'quality-and-safety.md'].map((name) => `references/${name}`),
  ]
  const missing = []
  for (const document of documents) {
    const source = readFileSync(join(root, document), 'utf8')
    for (const match of source.matchAll(/\[[^\]]*\]\((?!https?:|#)([^)]+)\)/g)) {
      const target = match[1].split('#')[0]
      if (!/\.(?:md|json)$/.test(target)) continue
      if (target && !existsSync(resolve(dirname(join(root, document)), target))) {
        missing.push(`${document} -> ${match[1]}`)
      }
    }
  }
  assert.deepEqual(missing, [])
})

test('the published bundle includes the complete reference directory', () => {
  assert.ok(shipped.includes('SKILL.md'))
  assert.ok(shipped.includes('references'))
  for (const file of ['capabilities.json', 'workflows.md', 'quality-and-safety.md']) {
    assert.ok(existsSync(join(root, 'references', file)), `missing references/${file}`)
  }
})

test('every reference page is watched or deliberately exempt from spec review', () => {
  const references = readdirSync(join(root, 'references'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => `references/${name}`)
    .sort()
  const watched = LEDGERS.flatMap((ledger) => ledger.reference ?? [])
  // workflows.md describes repository procedure rather than claims derived
  // from one spec document. It is still named here so a new reference page
  // cannot silently inherit the same exemption.
  const exempt = ['references/workflows.md']
  assert.deepEqual([...watched, ...exempt].sort(), references)
})
