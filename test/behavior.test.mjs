import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { carveToHtml, lintCarve } from '@markup-carve/carve'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const cases = JSON.parse(readFileSync(join(root, 'test', 'behavior.json'), 'utf8'))

for (const fixture of cases) {
  test(`behavior: ${fixture.name}`, () => {
    const findings = lintCarve(fixture.source)
    assert.deepEqual(findings, [], `unexpected lint findings: ${JSON.stringify(findings)}`)
    const html = carveToHtml(fixture.source)
    for (const fragment of fixture.htmlIncludes) assert.ok(
      html.includes(fragment),
      `rendered HTML did not include ${JSON.stringify(fragment)}:\n${html}`,
    )
    for (const fragment of fixture.htmlExcludes ?? []) assert.ok(
      !html.includes(fragment),
      `rendered HTML unexpectedly included ${JSON.stringify(fragment)}:\n${html}`,
    )
  })
}

test('the capability matrix names the engine used by behavioral tests', () => {
  const capabilities = JSON.parse(
    readFileSync(join(root, 'references', 'capabilities.json'), 'utf8'),
  )
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const range = packageJson.devDependencies['@markup-carve/carve']
  assert.equal(capabilities.testedEngine, `@markup-carve/carve@${range.replace(/^\^/, '')}`)
})
