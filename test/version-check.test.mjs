import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const script = join(root, 'scripts', 'check-installed-version.mjs')

test('reports a matching installed release as current without network access', () => {
  const output = execFileSync(process.execPath, [script, '--root', root, '--latest', 'v0.1.1'], {
    encoding: 'utf8',
  })
  assert.equal(output, 'carve-authoring 0.1.1 is current.\n')
})

test('exits nonzero and names both versions when an update is available', () => {
  const result = spawnSync(process.execPath, [script, '--root', root, '--latest', '0.2.0'], {
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /installed 0\.1\.1, latest 0\.2\.0/)
  assert.match(result.stderr, /Reinstall from https:\/\/github\.com\/markup-carve\/carve-skill/)
})
