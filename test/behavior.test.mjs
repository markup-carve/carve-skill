import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lint, render as carveToHtml } from '@markup-carve/carve'

// 0.2 `lint` is one call: the Markdown-habit rules are catalog rules of
// data/lint-rules.json, so nothing is composed any more.
const defaultLint = (source, rules) => lint(source, rules ? { rules } : undefined).map((finding) => finding.code)

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const cases = JSON.parse(readFileSync(join(root, 'test', 'behavior.json'), 'utf8'))

for (const fixture of cases) {
  test(`behavior: ${fixture.name}`, () => {
    const findings = defaultLint(fixture.source)
    assert.deepEqual(findings, [], `unexpected lint findings: ${JSON.stringify(findings)}`)
    const html = carveToHtml(fixture.source, fixture.options)
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

// THE CLEAN-LINT ASSERTION ABOVE HAS TO BE ABLE TO FAIL: the default rules
// report the two Markdown habits on their own. `djot-superscript-caret` and
// `djot-plus-bullet` are opt-in in 0.2 (data/lint-rules.json), so they report
// once turned on.
test('the clean-lint assertion sees the mistakes this skill exists to prevent', () => {
  for (const [source, rule] of [
    ['a **x** b', 'markdown-strong-double-star'],
    ['a ~~x~~ b', 'markdown-strikethrough-double-tilde'],
  ]) {
    assert.ok(defaultLint(source).includes(rule), `${JSON.stringify(source)} should report ${rule}, got ${JSON.stringify(defaultLint(source))}`)
  }
  for (const [source, rule] of [
    ['a ^x^ b', 'djot-superscript-caret'],
    ['+ item', 'djot-plus-bullet'],
  ]) {
    assert.ok(!defaultLint(source).includes(rule), `${rule} is on by default now; move it to the list above`)
    assert.ok(defaultLint(source, { [rule]: 'on' }).includes(rule), `${JSON.stringify(source)} should report ${rule} when it is on`)
  }
})

test('attribute tabs stay literal in the published engine', () => {
  const html = carveToHtml('{.a\t.b}\nx\n')
  assert.doesNotMatch(html, /class="a b"/)
  assert.match(html, /\{\.a\t\.b\}/)
})

test('a footnote in link text renders without a nested link', () => {
  const html = carveToHtml('[see[^1]](/u)\n\n[^1]: note\n')
  // 0.2 C2-H-088 (U-154): the mark follows the closing anchor.
  assert.match(html, /<a href="\/u">see<\/a><a id="fnref1"/)
  assert.doesNotMatch(html, /<a href="\/u">[^<]*<a /)
})

test('a plus line has no 0.1 attachment role under C2-B-059', () => {
  const html = carveToHtml('A paragraph.\n\n+\n\n> A quote.\n')
  assert.match(html, /<p>\+<\/p>/)
  assert.match(html, /<blockquote>/)
})

test('footnote labels fold spaces and tabs alike', () => {
  const definition = '[^a b]: note\n\n'
  const spaced = carveToHtml(definition + 'See [^a  b].\n')
  const tabbed = carveToHtml(definition + 'See [^a\tb].\n')
  assert.match(spaced, /role="doc-noteref"/)
  // 0.2 C2-I-079: a label folds tabs like spaces.
  assert.match(tabbed, /role="doc-noteref"/)
})

test('every 0.2 capability claim matches the pinned engine', () => {
  const capabilities = JSON.parse(readFileSync(join(root, 'references/capabilities.json'), 'utf8'))
  const features = Object.entries(capabilities.features)
  assert.ok(features.length >= 5, 'the capability matrix is unexpectedly small')
  for (const [name, feature] of features) {
    assert.ok(feature.clause && feature.source && feature.html, `${name} needs a clause, source, and HTML assertion`)
    const html = carveToHtml(feature.source)
    assert.ok(html.includes(feature.html), `${name} (${feature.clause}): ${JSON.stringify(html)} lacks ${JSON.stringify(feature.html)}`)
  }
})

test('capability probes identify the installed engine revision', () => {
  const capabilities = JSON.parse(readFileSync(join(root, 'references/capabilities.json'), 'utf8'))
  const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
  const installed = lock.packages['node_modules/@markup-carve/carve']
  assert.equal(capabilities.testedEngine, '@markup-carve/carve')
  assert.equal(capabilities.testedRevision, installed.resolved.split('#')[1])
})
