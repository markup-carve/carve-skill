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
  assert.equal(tokens, 770, 'update the published measurements when SKILL.md changes')
})

test('every supporting reference is explicitly routed from the entrypoint', () => {
  const references = readdirSync(join(root, 'references')).filter(
    (name) => name.endsWith('.md') || name.endsWith('.json'),
  )
  for (const name of references) {
    assert.ok(skill.includes(`](references/${name})`), `${name} is not routed`)
  }
})
