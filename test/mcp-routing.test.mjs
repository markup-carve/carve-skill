import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8')
const workflows = readFileSync(new URL('../references/workflows.md', import.meta.url), 'utf8')

test('the default context selects MCP without loading the complete workflow', () => {
  assert.match(skill, /Carve MCP is available/)
  assert.match(skill, /carve_lint/)
  assert.doesNotMatch(skill, /carve:\/\//)
  assert.doesNotMatch(skill, /carve_(?:parse|migrate)/)
})

test('conditional routing covers read, lint, structural edit, migration, publishing, and write paths', () => {
  for (const capability of [
    'carve://guide', 'carve://rules/{ruleId}', 'carve_lint', 'carve_parse',
    'carve_migrate', 'Render the target and inspect losses', 'stale-content hash',
  ]) assert.ok(workflows.includes(capability), `missing MCP route: ${capability}`)
  assert.match(workflows, /Do not load every resource pre-emptively/)
  assert.match(workflows, /If MCP is absent/)
})
