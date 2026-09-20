import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const script = join(root, 'scripts', 'check-installed-version.mjs')

// Read from the manifest the script itself reads, so a release bump does not
// have to touch this file.
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
const literal = version.replaceAll('.', '\\.')

test('reports a matching installed release as current without network access', () => {
  const output = execFileSync(process.execPath, [script, '--root', root, '--latest', `v${version}`], {
    encoding: 'utf8',
  })
  assert.equal(output, `carve-authoring ${version} is current.\n`)
})

test('exits nonzero and names both versions when an update is available', () => {
  const result = spawnSync(process.execPath, [script, '--root', root, '--latest', '9.0.0'], {
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, new RegExp(`installed ${literal}, latest 9\\.0\\.0`))
  assert.match(result.stderr, /Reinstall from https:\/\/github\.com\/markup-carve\/carve-skill/)
})
