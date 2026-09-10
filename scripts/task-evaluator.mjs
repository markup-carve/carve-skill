import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { carveToHtml, carveToPlainText, lintCarve } from '@markup-carve/carve'
import { countTokens } from 'gpt-tokenizer/model/gpt-5'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

function changedLines(before, after) {
  const left = before.split('\n')
  const right = after.split('\n')
  const lengths = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0))
  for (let i = 1; i <= left.length; i += 1) for (let j = 1; j <= right.length; j += 1) {
    lengths[i][j] = left[i - 1] === right[j - 1]
      ? lengths[i - 1][j - 1] + 1
      : Math.max(lengths[i - 1][j], lengths[i][j - 1])
  }
  return Math.max(left.length, right.length) - lengths[left.length][right.length]
}

export function evaluateCandidate(task, source, loadedReferences = task.loadedReferences ?? []) {
  const html = carveToHtml(source)
  const text = carveToPlainText(source)
  const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')
  const contextTokens = countTokens(skill) + loadedReferences.reduce(
    (total, name) => total + countTokens(readFileSync(join(root, 'references', name), 'utf8')),
    0,
  )
  const editLines = changedLines(task.input, source)
  const dimensions = {
    validCarve: lintCarve(source).length === 0,
    meaningPreserved: task.requiredText.every((fragment) => text.includes(fragment)),
    minimalEdit: editLines <= task.maxChangedLines,
    correctConstructs: task.requiredHtml.every((fragment) => html.includes(fragment)) &&
      task.forbiddenSource.every((fragment) => !source.includes(fragment)),
    contextBudget: contextTokens <= task.maxContextTokens,
  }
  return { name: task.name, score: Object.values(dimensions).filter(Boolean).length, maximum: Object.keys(dimensions).length,
    dimensions, changedLines: editLines, contextTokens }
}

export function loadTasks() {
  return JSON.parse(readFileSync(join(root, 'test', 'task-evals.json'), 'utf8'))
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Map(process.argv.slice(2).reduce((pairs, value, index, all) => index % 2 === 0 ? [...pairs, [value, all[index + 1]]] : pairs, []))
  const tasks = loadTasks()
  const requested = args.get('--task')
  const candidatePath = args.get('--candidate')
  if (Boolean(requested) !== Boolean(candidatePath)) throw new Error('Use --task <name> and --candidate <path> together.')
  if (args.has('--references') && !candidatePath) throw new Error('--references is valid only with a candidate evaluation.')
  const selected = requested ? tasks.filter(({ name }) => name === requested) : tasks
  if (requested && selected.length === 0) throw new Error(`Unknown task: ${requested}`)
  const references = args.has('--references') ? args.get('--references').split(',').filter(Boolean) : undefined
  const results = selected.map((task) => evaluateCandidate(
    task,
    candidatePath ? readFileSync(candidatePath, 'utf8') : task.gold,
    references ?? task.loadedReferences ?? [],
  ))
  const passed = results.every(({ score, maximum }) => score === maximum)
  process.stdout.write(`${JSON.stringify({ mode: candidatePath ? 'candidate' : 'gold-baseline', passed, results }, null, 2)}\n`)
  process.exitCode = passed ? 0 : 1
}
