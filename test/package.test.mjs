import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEDGERS } from '../scripts/review-ledgers.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const shipped = ['SKILL.md', ...JSON.parse(readFileSync(join(root, 'package.json'))).files]

test('every local Markdown link in shipped documentation resolves', () => {
  const documents = [
    'SKILL.md',
    'README.md',
    ...readdirSync(join(root, 'references'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => `references/${name}`),
  ]
  const missing = []
  for (const document of documents) {
    const source = readFileSync(join(root, document), 'utf8')
    for (const match of source.matchAll(/\[[^\]]*\]\((?!https?:|#)([^)]+)\)/g)) {
      const target = match[1].split('#')[0]
      if (!/\.(?:md|json)$/.test(target)) continue
      if (target && !existsSync(resolve(dirname(join(root, document)), target))) {
        missing.push(`${document} -> ${match[1]}`)
      }
    }
  }
  assert.deepEqual(missing, [])
})

test('the published bundle includes the complete reference directory', () => {
  assert.ok(shipped.includes('SKILL.md'))
  assert.ok(shipped.includes('references'))
  for (const file of ['capabilities.json', 'workflows.md', 'quality-and-safety.md']) {
    assert.ok(existsSync(join(root, 'references', file)), `missing references/${file}`)
  }
})

test('the published bundle includes Codex UI metadata', () => {
  assert.ok(shipped.includes('agents'))
  const metadataPath = join(root, 'agents', 'openai.yaml')
  assert.ok(existsSync(metadataPath), 'missing agents/openai.yaml')

  const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')
  const skillName = skill.match(/^name:\s*([^\s]+)$/m)?.[1]
  assert.ok(skillName, 'SKILL.md has no frontmatter name')

  const metadata = readFileSync(metadataPath, 'utf8')
  for (const key of ['display_name', 'short_description', 'default_prompt']) {
    assert.match(metadata, new RegExp(`^  ${key}:`, 'm'), `missing interface.${key}`)
  }
  assert.ok(
    metadata.includes(`$${skillName}`),
    `agents/openai.yaml default prompt does not invoke $${skillName}`,
  )
})

test('the published bundle includes the installed-version checker', () => {
  assert.ok(shipped.includes('scripts/check-installed-version.mjs'))
  assert.ok(existsSync(join(root, 'scripts', 'check-installed-version.mjs')))
})

test('every reference page is watched or deliberately exempt from spec review', () => {
  const references = readdirSync(join(root, 'references'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => `references/${name}`)
    .sort()
  // A SET, not a list: one reference page may draw on more than one spec
  // document, and each of those documents needs its own ledger. Since
  // carve#1932 split the extension guide from the extension contract,
  // references/extensions.md is watched by two.
  const watched = [...new Set(LEDGERS.flatMap((ledger) => ledger.reference ?? []))]
  // These pages describe agent procedure and editorial quality rather than
  // claims derived from one spec document. They are still named so a new
  // reference cannot silently inherit the same exemption.
  const exempt = ['references/reader-focused.md', 'references/workflows.md']
  assert.deepEqual([...watched, ...exempt].sort(), references)
})

// THE ROUND-TRIP LINT GATE HAS TO BE ABLE TO FAIL. `npm run lint:examples` is
// the CI step that stands for "the syntax this skill teaches is valid Carve",
// and it was spelled `carve lint examples/*.crv`. npm puts `node_modules/.bin`
// on PATH, and carve-js 0.1.7 started through that symlink printed nothing and
// exited 0 - the hazard references/validation.md documents, applied to this
// repository's own gate. Measured before the fix: an `examples/*.crv` holding
// `**x**` passed `npm run lint:examples` while the direct `dist/cli.js` path
// reported `markdown-strong-double-star` and exited 1. 0.1.9 reports it through
// the symlink too, which is exactly why the gate stays: the next regression
// would be invisible again.
//
// So the script is run here against a file that must fail, rather than being
// pattern-matched for a path that could be re-spelled correctly and still be
// wrong on the next release.
test('the round-trip lint script reports a document it must reject', () => {
  // On next2 `lint:examples` is scripts/check-samples.mjs, which lints every Carve
  // fence of SKILL.md and the references through the 0.2 CLI. It runs here on a
  // copy whose SKILL.md holds `**x**`, so the gate is shown to fail.
  const script = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts['lint:examples']
  assert.ok(script.includes('scripts/check-samples.mjs'), 'lint:examples no longer runs the sample check')

  const copy = mkdtempSync(join(tmpdir(), 'carve-skill-lint-'))
  for (const dir of ['scripts', 'references', 'examples']) mkdirSync(join(copy, dir))
  writeFileSync(join(copy, 'scripts', 'check-samples.mjs'), readFileSync(join(root, 'scripts', 'check-samples.mjs')))
  writeFileSync(join(copy, 'SKILL.md'), '```crv\na **x** b\n```\n')
  writeFileSync(join(copy, 'examples', 'showcase.crv'), 'Fine.\n')
  const cli = process.env.CARVE_CLI ?? join(root, 'node_modules', '@markup-carve', 'carve', 'dist', 'cli.js')
  const run = spawnSync(process.execPath, [join(copy, 'scripts', 'check-samples.mjs')], {
    encoding: 'utf8',
    env: { ...process.env, CARVE_CLI: cli },
  })

  assert.notEqual(
    run.status,
    0,
    'lint:examples exited 0 on a sample holding `**x**`, so the CI round-trip gate cannot fail. ' +
      `stdout: ${JSON.stringify(run.stdout)} stderr: ${JSON.stringify(run.stderr)}`,
  )
  assert.match(run.stdout + run.stderr, /markdown-strong-double-star/)
})
