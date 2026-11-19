import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8')
const workflows = readFileSync(new URL('../references/workflows.md', import.meta.url), 'utf8')
const routingCases = JSON.parse(readFileSync(new URL('./mcp-routing.json', import.meta.url), 'utf8'))
const routingTable = workflows.match(/## MCP routing\n[\s\S]*?\n\nDo not load/)?.[0] ?? ''

test('the default context selects MCP without loading the complete workflow', () => {
  assert.match(skill, /Carve MCP is available/)
  assert.match(skill, /carve_lint/)
  assert.doesNotMatch(skill, /carve:\/\//)
  assert.doesNotMatch(skill, /carve_(?:parse|migrate)/)
})

test('conditional routing covers read, lint, structural edit, migration, publishing, and write paths', () => {
  for (const capability of [
    'carve://guide', 'carve://rules/{ruleId}', 'carve_lint', 'carve_parse',
    'carve_migrate', 'carve_diagnose_and_fix', 'carve_plan_ast_edit',
    'carve_check_targets', 'carve_review_workspace', 'carve_reference_graph',
    'carve_prepare_workspace_edits', 'carve_workspace_info',
    'expectedSha256',
  ]) assert.ok(workflows.includes(capability), `missing MCP route: ${capability}`)
  assert.match(workflows, /Do not load every resource pre-emptively/)
  assert.match(workflows, /If MCP is absent/)
})

test('task-level routing cases name a documented capability and rationale', () => {
  assert.equal(routingCases.length, 7)
  assert.equal(new Set(routingCases.map(({ task }) => task)).size, routingCases.length)
  for (const { task, capability, alsoRequires = [], reason } of routingCases) {
    assert.ok(task.length > 20, 'routing task should express a concrete user need')
    assert.ok(reason.length > 20, `missing rationale for ${task}`)
    for (const tool of [capability, ...alsoRequires]) {
      assert.ok(routingTable.includes(tool), `${task} routes to undocumented ${tool}`)
    }
  }
})
