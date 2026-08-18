// THE SYNTAX REFERENCE, EXECUTED.
//
// test/drift.test.mjs watches the SPEC for movement and checks that a set of
// construct tokens is PRESENT somewhere in the skill. Neither half can catch the
// failure that matters most here, which is the skill stating a rule that is
// false.
//
// Measured, on the guard as it stood: rewrite references/syntax.md's emphasis
// rows to Markdown's spelling - `*italic*` for italic, `**bold**` for bold, the
// exact mistake this skill exists to prevent - and `npm test` stays green at 5
// of 5, because `/italic/` still occurs in SKILL.md and the token check reads
// all five files concatenated. `npm run lint:examples` stays green too: the
// showcase does not depend on the reference prose. So the file every agent in
// the org writes Carve from could teach the opposite of the language and no
// check in this repository would say so.
//
// This file closes that by RUNNING the table. Each row of the inline syntax
// table is a claim of the form "writing X produces Y"; the engine is the arbiter
// of whether it does. Nothing is copied here - the sources and the claims are
// read out of references/syntax.md, so there is no second list to fall out of
// step with the first, which is the property drift.test.mjs opens by insisting
// on.
//
// SCOPE, deliberately narrow: the inline formatting family, whose rendering
// depends on nothing outside the snippet. Rows like `[Page Name][]` or
// `</#section-id>` describe RESOLUTION against a document that is not there, and
// would fail for reasons that are not drift. Every concept below must still be
// exercised by some row (the last test), so narrowing the scope by deleting or
// rewording a row is itself a failure rather than a quiet reduction in coverage.

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { carveToHtml } from '@markup-carve/carve'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const syntax = readFileSync(join(root, 'references', 'syntax.md'), 'utf8')

// A word in a row's RESULT column, and the element the engine must produce for
// that row's source. The key is matched against the lowercased result text, so
// "bold italic" names both `<strong>` and `<em>` and is checked for both.
const CONCEPTS = [
  ['italic', '<em>'],
  ['bold', '<strong>'],
  ['underline', '<u>'],
  ['strike', '<s>'],
  ['superscript', '<sup>'],
  ['subscript', '<sub>'],
  ['highlight', '<mark>'],
  ['inline code', '<code>'],
]

/**
 * The first code span in a table cell, which is the row's Carve source.
 * Handles the double-backtick spelling the table uses when the source itself
 * contains a backtick (`` `code` ``).
 */
const firstCodeSpan = (cell) => {
  const double = /``\s?(.+?)\s?``/.exec(cell)
  if (double) return double[1]
  const single = /`([^`]+)`/.exec(cell)
  return single ? single[1] : null
}

/** Every `| write | result |` row of the reference's tables. */
const rows = () => {
  const found = []
  for (const line of syntax.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue
    const cells = trimmed.slice(1, -1).split('|')
    if (cells.length !== 2) continue
    const [write, result] = cells.map((c) => c.trim())
    if (!write || /^-+$/.test(write) || write === 'Write') continue
    const source = firstCodeSpan(write)
    if (source === null) continue
    found.push({ source, result, line: trimmed })
  }
  return found
}

/** The rows whose result column names at least one concept above. */
const claims = () => {
  const out = []
  for (const row of rows()) {
    const result = row.result.toLowerCase()
    const expect = CONCEPTS.filter(([word]) => result.includes(word)).map(([, tag]) => tag)
    if (expect.length) out.push({ ...row, expect })
  }
  return out
}

test('the syntax reference is a table this test can read', () => {
  // Without this, every assertion below is quantified over an empty list and
  // holds no matter what references/syntax.md says - the shape
  // markup-carve/carve#755 collects. Measured: empty the file and the rest of
  // this suite passes silently, which is exactly the state being removed.
  const all = rows()
  assert.ok(
    all.length >= 20,
    `references/syntax.md yielded ${all.length} two-column rows, which is fewer than ` +
      'the reference has ever had. Either the file was emptied or its table format ' +
      'changed and this test is now reading nothing.',
  )
})

test('every formatting claim the syntax reference makes is true of the engine', () => {
  const wrong = []
  for (const { source, result, expect, line } of claims()) {
    let html
    try {
      html = carveToHtml(source)
    } catch (error) {
      wrong.push(`${line}\n    threw: ${String(error.message).split('\n')[0]}`)
      continue
    }
    const missing = expect.filter((tag) => !html.includes(tag))
    if (missing.length) {
      wrong.push(
        `${line}\n    claims ${JSON.stringify(result)}, so ${missing.join(' and ')} was ` +
          `expected\n    engine rendered: ${JSON.stringify(html.trim())}`,
      )
    }
  }
  assert.deepEqual(
    wrong,
    [],
    'references/syntax.md states rule(s) the engine does not follow. The skill is ' +
      'what every agent writes Carve from, so a row here that is wrong is wrong ' +
      'Carve written confidently:\n  ' + wrong.join('\n  '),
  )
})

test('no formatting concept has dropped out of the syntax reference', () => {
  // The test above is quantified over the rows that MATCH a concept, so deleting
  // a row - or rewording its result column past recognition - would remove the
  // claim rather than falsify it, and read as a pass. Each concept must keep at
  // least one row.
  const exercised = new Set(claims().flatMap(({ expect }) => expect))
  const unexercised = CONCEPTS
    .map(([word, tag]) => tag)
    .filter((tag) => !exercised.has(tag))
  assert.deepEqual(
    unexercised,
    [],
    `no row of references/syntax.md's tables claims ${unexercised.join(', ')} any more. ` +
      'A concept with no row is a rule this suite stopped checking, not one the ' +
      'language dropped.',
  )
})
