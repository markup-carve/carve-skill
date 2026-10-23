import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LIB_VERSION, carveToHtml, djotMigrationWarnings, lintCarve } from '@markup-carve/carve'

// WHAT `carve lint` MEANS, PROGRAMMATICALLY. The CLI's default mode is two
// calls, not one: `lintCarve` for the semantic rules and `djotMigrationWarnings`
// for the Markdown-habit family, filtered to the `carve-breakage` category
// (`--from-djot` keeps `djot-shift` as well). `lintCarve` alone cannot see
// `**bold**`, `~~strike~~`, `^sup^` or a `+` bullet - the four mistakes this
// skill exists to prevent - so a fixture written with one of them passed the
// clean-lint assertion below. Measured on 0.1.9: `lintCarve('a **x** b')` is
// `[]` while `carve lint` on the same bytes reports
// `markdown-strong-double-star`.
const defaultLint = (source) => [
  ...lintCarve(source).map((finding) => finding.rule),
  ...djotMigrationWarnings(source)
    .filter((warning) => warning.category === 'carve-breakage')
    .map((warning) => warning.rule),
]

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const cases = JSON.parse(readFileSync(join(root, 'test', 'behavior.json'), 'utf8'))

for (const fixture of cases) {
  test(`behavior: ${fixture.name}`, () => {
    const findings = defaultLint(fixture.source)
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

// THE CLEAN-LINT ASSERTION ABOVE HAS TO BE ABLE TO FAIL. It was written against
// `lintCarve` alone, which is blind to the whole Markdown-habit family, so for
// every fixture in this file it could only ever pass. Both halves are asserted:
// that the composed call reports the mistake, and that the single call does not,
// because the day `lintCarve` absorbs these rules this test should say so rather
// than keep composing a call that no longer needs composing.
test('the clean-lint assertion sees the mistakes this skill exists to prevent', () => {
  for (const [source, rule] of [
    ['a **x** b', 'markdown-strong-double-star'],
    ['a ~~x~~ b', 'markdown-strikethrough-double-tilde'],
    ['a ^x^ b', 'djot-superscript-caret'],
    ['+ item', 'djot-plus-bullet'],
  ]) {
    assert.ok(
      defaultLint(source).includes(rule),
      `${JSON.stringify(source)} should report ${rule}, got ${JSON.stringify(defaultLint(source))}`,
    )
    assert.deepEqual(
      lintCarve(source).map((finding) => finding.rule),
      [],
      `lintCarve now reports ${JSON.stringify(source)} on its own; drop the composition in defaultLint ` +
        'and the paragraph about it in references/validation.md',
    )
  }
})

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
  admonition_landmark_name: {
    source: '::: note\nplain\n:::\n\n::: note "Pro tip"\ntitled\n:::',
    presentAll: ['aria-label="Note"', 'aria-labelledby="adm-1"'],
  },
  raw_html: { source: 'a `<br>`{=html} b', present: '<br>' },
  // The vertical axis rides on the SAME marker as the horizontal one, so a
  // present-check for `text-align` cannot tell support from its absence: the
  // engine emitted that before the second axis existed. `vertical-align` is the
  // half that only appears once the feature does.
  vertical_cell_alignment: { source: '|=<^ A |\n| x |', present: 'vertical-align: top' },
  // The CLOSING half is what tells the exemption from its absence: `_*x*_`
  // marking proves a bare `*` opened against a `_`, and the second line proves
  // the exemption is conditional on the outer span closing rather than a blanket
  // relaxation of the guard.
  nested_bare_emphasis: {
    source: '_*x*_\n\n_*y* q',
    presentAll: ['<u><strong>x</strong></u>', '_*y* q'],
  },
  // A LINT probe, not a render one. The claim is about what the LINTER reports;
  // rendering this sample would only re-measure the degradation the skill
  // already documents, and would go on passing after the rule ships. The matrix
  // records `false`, so this reads "no finding names it" and flips on its own
  // the release the engine starts emitting it.
  fence_opener_fallback_lint: {
    source: 'Intro.\n\n```js {.diff}\nx\n```\n',
    lintRule: 'fence-opener-fallback',
  },
  // The PLACING path is the probe, because the degraded `<div>` already carries
  // the title: rendering the no-footnotes marker would read as support while the
  // section that places still drops it.
  directive_title: {
    source: 'T[^1]\n\n::: footnotes "Reader notes"\n:::\n\n[^1]: n\n',
    present: 'Reader notes',
  },
  footnotes_placement_lint: {
    source: 'T[^1]\n\n> ::: footnotes\n> :::\n\n[^1]: n\n',
    lintRule: 'footnotes-placement-in-container',
  },
  // `==>` rather than `=>`: the doubled family arriving and `=>` ceasing to
  // convert were ONE release, so probing `=>` would now measure the opposite of
  // this entry and read as a regression rather than the feature.
  doubled_arrows: { source: 'a ==> b', present: '⇒' },
  first_block_marker_quote: {
    source: '> +\n```\ncode\n```\n',
    presentBefore: ['<pre><code>code', '</blockquote>'],
  },
  // The nested item's own marker column: the quote must land inside `b`, so it
  // opens before the first `</li>`, which closes `b`.
  relative_plus_marker: {
    source: '- a\n  - b\n  +\n  > q\n',
    presentBefore: ['<blockquote>', '</li>'],
  },
  first_block_marker_footnote: {
    source: '[^a]: +\n```\ncode\n```\n\nSee [^a].\n',
    presentBefore: ['<li id="fn1">', '<pre><code>code'],
  },
  delimited_table: { source: '{table}\n```csv\nName,Score\n"Lee, A",3\n```\n', present: '<td>Lee, A</td>' },
  empty_destination: { source: '[t]() and ![i]()\n', presentAll: ['<a href="">t</a>', 'src=""'] },
  // The closer is the half the guard changed: an opener before a combining
  // mark was never at a word boundary, so it cannot tell the rule apart.
  grapheme_delimiter: { source: '*a*\u0301 b\n', present: '*a*\u0301' },
}

test('attribute tabs stay literal in the published engine', () => {
  const html = carveToHtml('{.a\t.b}\nx\n')
  assert.doesNotMatch(html, /class="a b"/)
  assert.match(html, /\{\.a\t\.b\}/)
})

test('a footnote in link text renders without a nested link', () => {
  const html = carveToHtml('[see[^1]](/u)\n\n[^1]: note\n')
  assert.match(html, /<a href="\/u">see<sup/)
  assert.doesNotMatch(html, /<a href="\/u">[^<]*<a /)
})

test('first-block marker in a footnote pulls a block but not a column-0 list', () => {
  const code = carveToHtml('[^a]: +\n```\ncode\n```\n\nSee [^a].\n')
  assert.match(code, /<li id="fn1">[\s\S]*<pre><code>code/)
  const list = carveToHtml('[^a]: +\n- a list\n\nSee [^a].\n')
  assert.match(list, /^<ul>\n  <li>a list<\/li>/)
  assert.ok(lintCarve('[^a]: +\n- a list\n\nSee [^a].\n').some((finding) => finding.rule === 'continuation-marker-refused'))
})

test('footnote labels match spaces but keep tabs distinct', () => {
  const definition = '[^a b]: note\n\n'
  const spaced = carveToHtml(definition + 'See [^a  b].\n')
  const tabbed = carveToHtml(definition + 'See [^a\tb].\n')
  assert.match(spaced, /role="doc-noteref"/)
  assert.doesNotMatch(tabbed, /role="doc-noteref"/)
})

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
    if (probe.lintRule) {
      const reported = defaultLint(probe.source)
      if (reported.includes(probe.lintRule) !== feature.inTestedEngine) {
        findings.push(
          `${name}: matrix says ${feature.inTestedEngine}, ` +
            `${capabilities.testedEngine} lints it as ${JSON.stringify(reported)}`,
        )
      }
      continue
    }
    const html = carveToHtml(probe.source)
    let observed
    if (probe.presentBefore) {
      const [needle, marker] = probe.presentBefore
      const at = html.indexOf(needle)
      const closes = html.indexOf(marker)
      observed = at !== -1 && closes !== -1 && at < closes
    } else if (probe.presentAll) {
      observed = probe.presentAll.every(fragment => html.includes(fragment))
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
// at a release cut. Trap 12 in the block/container guide names the discriminator for that
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
