#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const cli = process.env.CARVE_CLI
if (!cli) {
  process.stderr.write('Set CARVE_CLI to the absolute path of a built carve-js main dist/cli.js\n')
  process.exit(2)
}
const files = ['SKILL.md', ...readdirSync(join(root, 'references')).filter(x => x.endsWith('.md')).map(x => `references/${x}`)]
let count = 0
let failures = 0
let htmlChecks = 0
for (const file of files) {
  const lines = readFileSync(join(root, file), 'utf8').split('\n')
  let previous = null
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\`{3,})(crv|carve|html)$/.exec(lines[i])
    if (!open) continue
    const start = i + 1
    const fence = open[1]
    let end = start
    while (end < lines.length && lines[end] !== fence) end++
    if (end === lines.length) throw new Error(`${file}:${start}: unclosed ${open[2]} fence`)
    const sample = lines.slice(start, end).join('\n') + '\n'
    i = end
    if (open[2] === 'html') {
      if (previous && previous.end === start - 1) {
        htmlChecks++
        if (sample.trimEnd() !== previous.html.trimEnd()) {
          process.stderr.write(`${file}:${start}: shown HTML differs from render\nExpected:\n${sample}Actual:\n${previous.html}`)
          failures++
        }
      }
      previous = null
      continue
    }
    count++
    const label = `${file}:${start}`
    for (const command of [['lint'], ['fmt', '--check']]) {
      const run = spawnSync(process.execPath, [cli, ...command, '-'], { input: sample, encoding: 'utf8' })
      if (run.status !== 0) {
        process.stderr.write(`${label}: ${command.join(' ')} failed\n${run.stdout}${run.stderr}`)
        failures++
      }
    }
    const rendered = spawnSync(process.execPath, [cli, 'render', '-'], { input: sample, encoding: 'utf8' })
    if (rendered.status !== 0) {
      process.stderr.write(`${label}: render failed\n${rendered.stdout}${rendered.stderr}`)
      failures++
    }
    previous = { end: end + 1, html: rendered.stdout }
  }
}
const showcase = readFileSync(join(root, 'examples/showcase.crv'), 'utf8')
for (const command of [['lint'], ['fmt', '--check'], ['render']]) {
  const run = spawnSync(process.execPath, [cli, ...command, '-'], { input: showcase, encoding: 'utf8' })
  if (run.status !== 0) {
    process.stderr.write(`examples/showcase.crv: ${command.join(' ')} failed\n${run.stdout}${run.stderr}`)
    failures++
  }
}
count++
process.stdout.write(`Carve samples: ${count}; HTML comparisons: ${htmlChecks}; failures: ${failures}\n`)
process.exit(failures ? 1 : 0)
