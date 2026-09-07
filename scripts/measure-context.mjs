import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { countTokens } from 'gpt-tokenizer/model/gpt-5'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const valueAfter = (flag) => {
  const at = args.indexOf(flag)
  if (at === -1) return null
  const value = args[at + 1]
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`)
  return value
}
const baselineRef = valueAfter('--baseline-ref')
const json = args.includes('--json')

const measure = (text) => ({
  bytes: Buffer.byteLength(text),
  words: text.trim().split(/\s+/).filter(Boolean).length,
  tokens: countTokens(text),
})
const read = (path) => readFileSync(join(root, path), 'utf8')
const fromRef = (ref, path) =>
  execFileSync('git', ['show', `${ref}:${path}`], { cwd: root, encoding: 'utf8' })

const references = readdirSync(join(root, 'references'))
  .filter((name) => name.endsWith('.md') || name.endsWith('.json'))
  .sort()
  .map((name) => `references/${name}`)
const skill = read('SKILL.md')
const current = measure(skill)
const tokenizerVersion = JSON.parse(read('node_modules/gpt-tokenizer/package.json')).version
const frontmatter = /^---\n([\s\S]*?)\n---/.exec(skill)
if (!frontmatter) throw new Error('SKILL.md has no YAML frontmatter')

const result = {
  tokenizer: `gpt-tokenizer ${tokenizerVersion}, GPT-5 (o200k)`,
  stages: {
    discovery: measure(frontmatter[1]),
    default: current,
    references: Object.fromEntries(references.map((path) => [path, measure(read(path))])),
  },
}

if (baselineRef) {
  const baseline = measure(fromRef(baselineRef, 'SKILL.md'))
  result.baseline = { ref: baselineRef, ...baseline }
  result.reduction = {
    tokens: baseline.tokens - current.tokens,
    percent: Number((((baseline.tokens - current.tokens) / baseline.tokens) * 100).toFixed(1)),
  }
}

if (json) {
  console.log(JSON.stringify(result, null, 2))
} else {
  console.log(`Tokenizer: ${result.tokenizer}`)
  if (result.baseline) console.log(`Baseline (${baselineRef}): ${result.baseline.tokens} tokens`)
  console.log(`Default SKILL.md: ${current.tokens} tokens`)
  if (result.reduction) console.log(`Reduction: ${result.reduction.tokens} tokens (${result.reduction.percent}%)`)
  console.log(`Discovery metadata: ${result.stages.discovery.tokens} tokens`)
  for (const [path, size] of Object.entries(result.stages.references)) {
    console.log(`${path}: +${size.tokens} tokens when routed`)
  }
}
