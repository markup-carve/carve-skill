import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateCandidate, loadTasks } from '../scripts/task-evaluator.mjs'

const tasks = loadTasks()

for (const task of tasks) {
  test(`task eval gold: ${task.name}`, () => {
    assert.deepEqual(evaluateCandidate(task, task.gold).dimensions, {
      validCarve: true,
      meaningPreserved: true,
      minimalEdit: true,
      correctConstructs: true,
      contextBudget: true,
    })
  })
}

test('the scorer rejects Markdown habits and excessive context', () => {
  const task = tasks[0]
  const result = evaluateCandidate(task, 'A *lean* and **strong** statement.', [
    'syntax.md', 'traps-foundations.md', 'traps-blocks-containers.md',
  ])
  assert.equal(result.dimensions.correctConstructs, false)
  assert.equal(result.dimensions.contextBudget, false)
  assert.ok(result.score < result.maximum)
})
