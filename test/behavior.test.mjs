import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LIB_VERSION, carveToHtml, lintCarve } from '@markup-carve/carve'

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

// Every feature the matrix records a boolean for, and the document that proves
// it. The matrix is machine-readable guidance an agent acts on, and until this
// existed nothing checked its VALUES against the engine - only that the version
// string matched package.json. Two entries had gone stale as a result:
// `delimited_comment` and `container_exact_closer` both shipped and both still
// read `false`, telling agents to avoid syntax that works.
//
// A probe is required for each feature rather than optional, so adding a
// feature without a way to check it fails here instead of landing unverified.
const PROBES = {
  trailing_comment: { source: 'a %% hidden', absent: 'hidden' },
  fenced_comment: { source: 'a\n\n%%%\nhidden\n%%%\n\nb', absent: 'hidden' },
  delimited_comment: { source: 'a {% hidden %} b', absent: 'hidden' },
  container_exact_closer: {
    source: '::: note\n::: tip\nInner.\n:::\n:::',
    // NOT `present: 'admonition tip'`. Two SIBLING containers contain that
    // string too, so the substring cannot tell support from the failure it is
    // supposed to catch. The question that separates them is whether the inner
    // container opens before the outer one closes.
    presentBefore: ['admonition tip', '</aside>'],
  },
  raw_html: { source: 'a `<br>`{=html} b', present: '<br>' },
}

test('every capability the matrix records is true of the engine', () => {
  const capabilities = JSON.parse(
    readFileSync(join(root, 'references', 'capabilities.json'), 'utf8'),
  )
  const features = Object.entries(capabilities.features)
  assert.ok(features.length > 0, 'references/capabilities.json records no features')

  const findings = []
  for (const [name, feature] of features) {
    // A non-boolean value ("host-dependent") is a statement about the host, not
    // about the engine, and there is nothing here to render it against.
    if (typeof feature.inTestedEngine !== 'boolean') continue

    const probe = PROBES[name]
    if (!probe) {
      findings.push(`${name}: recorded as ${feature.inTestedEngine} with no probe in PROBES`)
      continue
    }
    const html = carveToHtml(probe.source)
    let observed
    if (probe.presentBefore) {
      const [needle, marker] = probe.presentBefore
      const at = html.indexOf(needle)
      const closes = html.indexOf(marker)
      observed = at !== -1 && closes !== -1 && at < closes
    } else if (probe.present) {
      observed = html.includes(probe.present)
    } else {
      observed = !html.includes(probe.absent)
    }
    if (observed !== feature.inTestedEngine) {
      findings.push(
        `${name}: matrix says ${feature.inTestedEngine}, ` +
          `${capabilities.testedEngine} renders ${JSON.stringify(html.trim())}`,
      )
    }
  }

  assert.deepEqual(
    findings,
    [],
    'references/capabilities.json disagrees with the engine it names. It is guidance an ' +
      'agent acts on, so a stale entry tells agents to avoid syntax that works:\n' +
      findings.join('\n'),
  )
})

// The matrix names a version and the probes above run whatever is INSTALLED,
// and `^0.1.4` lets those two be different things: a lockfile that advances to
// 0.1.5 would have the probes record 0.1.5 behavior under a matrix still headed
// 0.1.4. That is this repository's own incident in miniature - a claim labelled
// with a version nobody re-checked - so the label is compared against the
// engine that was actually imported, not against the range's lower bound.
//
// LIB_VERSION cannot separate a published release from a git build of carve-js
// `main`: both report the version their package.json carries, which only moves
// at a release cut. references/traps.md 12 names the discriminator for that
// (the SMART_PUNCTUATION_GLYPHS arrow count), and the scheduled workflow checks
// the lockfile against the newest published release.
test('the capability matrix names the engine the probes actually ran', () => {
  const capabilities = JSON.parse(
    readFileSync(join(root, 'references', 'capabilities.json'), 'utf8'),
  )
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const range = packageJson.devDependencies['@markup-carve/carve']

  assert.equal(
    capabilities.testedEngine,
    `@markup-carve/carve@${LIB_VERSION}`,
    'references/capabilities.json names an engine other than the one these tests imported, ' +
      'so every value it records is attributed to a version that did not produce it',
  )
  assert.equal(
    capabilities.testedEngine,
    `@markup-carve/carve@${range.replace(/^\^/, '')}`,
    'the matrix and package.json disagree about the engine',
  )
})
