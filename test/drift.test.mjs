import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const inventory = JSON.parse(readFileSync(join(root, 'test/skill-02-sources.json'), 'utf8'))
const read = path => readFileSync(join(root, path), 'utf8')

test('the pinned 0.2 spec checkout is present', () => {
  assert.ok(existsSync(join(root, 'spec/spec/0.2/README.md')), 'initialize the spec submodule')
  assert.ok(Object.keys(inventory).length >= 15, 'the 0.2 source inventory is unexpectedly small')
})

for (const [source, expected] of Object.entries(inventory)) {
  test(`reviewed 0.2 source: ${source}`, () => {
    const actual = createHash('sha256').update(read(`spec/${source}`)).digest('hex')
    assert.equal(actual, expected, `review skill guidance against spec/${source} before updating the inventory`)
  })
}

test('the syntax and trap guides route to the current 0.2 chapters', () => {
  const syntax = read('references/syntax.md')
  const guides = ['traps-foundations.md', 'traps-blocks-containers.md', 'traps-structure-references.md', 'traps-migration.md']
    .map(name => read(`references/${name}`)).join('\n')
  for (const chapter of ['syntax-blocks.md', 'syntax-inline.md']) {
    assert.ok(syntax.includes(chapter), `syntax card lost ${chapter}`)
    assert.ok(guides.includes(chapter), `trap guides lost ${chapter}`)
  }
  for (const token of ['/word/', '*word*', '{_word_}', '{~word~}', '{^2^}', '{,2,}', '{=word=}', '</#']) {
    assert.ok(syntax.includes(token), `syntax card lost ${token}`)
  }
})
