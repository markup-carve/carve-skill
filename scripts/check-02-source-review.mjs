#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const inventoryPath = join(root, 'test/skill-02-sources.json')
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'))
const checkout = resolve(process.argv.find(x => x !== '--write' && x !== process.argv[0] && x !== process.argv[1]) ?? join(root, 'spec'))
const next = {}
let changed = 0
for (const [path, recorded] of Object.entries(inventory)) {
  const current = createHash('sha256').update(readFileSync(join(checkout, path))).digest('hex')
  next[path] = current
  if (current !== recorded) {
    process.stdout.write(`${path}: changed; re-read the affected skill reference\n`)
    changed++
  }
}
if (process.argv.includes('--write')) {
  if (checkout !== join(root, 'spec')) throw new Error('--write requires the pinned submodule')
  writeFileSync(inventoryPath, JSON.stringify(next, null, 2) + '\n')
  process.stdout.write(`Recorded ${Object.keys(next).length} source files after review\n`)
} else {
  process.stdout.write(`${Object.keys(next).length} source files checked; ${changed} changed\n`)
  process.exitCode = changed ? 3 : 0
}
