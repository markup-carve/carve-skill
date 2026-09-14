import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { countTokens } from 'gpt-tokenizer/model/gpt-5'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')

test('default-loaded skill stays within its measured context budget', () => {
  const tokens = countTokens(skill)
  assert.ok(tokens <= 800, `SKILL.md is ${tokens} GPT-5 tokens; move conditional detail to references`)
  assert.equal(tokens, 795, 'update the published measurements when SKILL.md changes')
})

test('published progressive-disclosure profiles stay exact', () => {
  const tokens = (name) => countTokens(readFileSync(join(root, 'references', name), 'utf8'))
  const current = countTokens(skill)
  const trapTokens = readdirSync(join(root, 'references'))
    .filter((name) => /^traps-(?!migration\.md$)/.test(name))
    .map(tokens)
  assert.deepEqual(
    {
      routine: current + tokens('syntax.md'),
      foundations: current + tokens('traps-foundations.md'),
      blocks: current + tokens('traps-blocks-containers.md'),
      structure: current + tokens('traps-structure-references.md'),
      largestMigration:
        current +
        tokens('syntax.md') +
        Math.max(...trapTokens) +
        tokens('traps-migration.md'),
    },
    { routine: 2363, foundations: 3645, blocks: 4235, structure: 2475, largestMigration: 6105 },
    'update the published profile table when routed references change',
  )
})

test('every supporting reference is explicitly routed from the entrypoint', () => {
  const references = readdirSync(join(root, 'references')).filter(
    (name) => name.endsWith('.md') || name.endsWith('.json'),
  )
  for (const name of references) {
    assert.ok(skill.includes(`](references/${name})`), `${name} is not routed`)
  }
})
