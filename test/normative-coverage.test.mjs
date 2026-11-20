import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const root = resolve(import.meta.dirname, '..', 'spec/spec/0.2')
const chapters = ['syntax-blocks', 'syntax-inline', 'html', 'ast', 'writer', 'includes', 'tooling', 'extensions', 'import-html', 'source-layout']
const ids = new Set()

test('0.2 clauses have unique ids across the normative chapters', () => {
  for (const chapter of chapters) {
    const source = readFileSync(join(root, `${chapter}.md`), 'utf8')
    const found = [...source.matchAll(/^\*\*(?:Exception )?(C2-[A-Z]-\d{3})\*\*/gm)].map(match => match[1])
    assert.ok(found.length >= 3, `${chapter} has too few clauses`)
    for (const id of found) {
      assert.ok(!ids.has(id), `${id} is repeated`)
      ids.add(id)
    }
  }
  assert.ok(ids.size > 300, `only ${ids.size} clauses found`)
})

test('0.2 conformance cases cite existing clauses', () => {
  if (ids.size === 0) {
    for (const chapter of chapters) {
      for (const match of readFileSync(join(root, `${chapter}.md`), 'utf8').matchAll(/^\*\*(?:Exception )?(C2-[A-Z]-\d{3})\*\*/gm)) ids.add(match[1])
    }
  }
  const cases = JSON.parse(readFileSync(join(root, 'conformance/clause-cases.json'), 'utf8')).cases
  assert.ok(cases.length > 100, `only ${cases.length} cases found`)
  for (const row of cases) {
    assert.ok(row.clauses.length > 0, `${row.id} cites no clause`)
    for (const id of row.clauses) assert.ok(ids.has(id), `${row.id} cites missing ${id}`)
  }
})
