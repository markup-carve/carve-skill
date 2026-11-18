import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const inventory = JSON.parse(readFileSync(join(root, 'test', 'skill-02-sources.json'), 'utf8'))
const hash = text => createHash('sha256').update(text).digest('hex')

test('the reviewed 0.2 spec and docs are still pinned', () => {
  assert.ok(Object.keys(inventory).length >= 15)
  for (const [path, digest] of Object.entries(inventory)) {
    const file = join(root, 'spec', path)
    assert.ok(existsSync(file), `${path} is missing`)
    assert.equal(hash(readFileSync(file)), digest, `${path} changed; review the references and update the inventory`)
  }
})

test('all references and capabilities point to existing local sources', () => {
  const references = readdirSync(join(root, 'references')).filter(x => x.endsWith('.md'))
  const docs = ['SKILL.md', ...references.map(x => `references/${x}`)]
  for (const doc of docs) {
    const content = readFileSync(join(root, doc), 'utf8')
    for (const match of content.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      if (/^https?:/.test(match[1]) || !/\.(?:md|json)$/.test(match[1])) continue
      assert.ok(existsSync(resolve(root, dirname(doc), match[1])), `${doc}: missing ${match[1]}`)
    }
  }
  const capabilities = JSON.parse(readFileSync(join(root, 'references/capabilities.json'), 'utf8'))
  for (const path of Object.values(capabilities.source)) assert.ok(existsSync(join(root, 'spec', path)))
})

test('the skill entrypoint routes to each maintained reference', () => {
  const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')
  for (const file of readdirSync(join(root, 'references')).filter(x => x.endsWith('.md'))) {
    assert.ok(skill.includes(`references/${file}`), `${file} is not routed`)
  }
})
