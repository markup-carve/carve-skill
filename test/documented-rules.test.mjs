// EVERY RULE THE SKILL DOCUMENTS, EXECUTED - WHEREVER IT IS DOCUMENTED.
//
// test/executable-syntax.test.mjs runs the claims in ONE file's ONE table shape:
// its `rows()` reads references/syntax.md and skips any row whose cell count is
// not 2. That closed the hole the audit found, and it closes only that hole.
// Measured against it, each of these stayed green at 8 of 8:
//
//   - references/traps.md trap 4, the table that IS the swapped-emphasis rule,
//     rewritten so `*text*` is italic and `/text/` is bold. It is a table, but a
//     THREE-column one (`| Effect | Markdown/Djot | Carve |`), so being a table
//     is not what puts a claim in scope - being syntax.md's two-column table is.
//   - SKILL.md's "rules you will get wrong (read first)" list, inverted in
//     PROSE. This is the worse one: it is the first thing an agent reads.
//   - The braced-only sup/sub rule, inverted in both places it is stated, so
//     the skill said bare `^x^` marks. It does not; it is literal.
//   - The fence-longer-than-content rule, inverted to say equal length is fine.
//
// And traps.md's worked examples - a Carve block followed by the HTML it claims
// to render - were never executed at all by anything.
//
// The mechanism here is the same one and the only one: RENDER THE DOCUMENTED
// SOURCE AND COMPARE IT TO WHAT THE DOCUMENT CLAIMS. Token presence is not used
// anywhere, because token presence is the defect being removed - it cannot tell
// a rule that moved from a rule that was contradicted.
//
// Every arm carries a population guard derived from the content itself rather
// than a hand-written floor: a claim that stops being extractable is a failure,
// not a quiet reduction in coverage.

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { carveToHtml } from '@markup-carve/carve'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const FILES = [
  'SKILL.md',
  'references/syntax.md',
  'references/traps.md',
  'references/extensions.md',
  'references/validation.md',
]
const read = (f) => readFileSync(join(root, f), 'utf8')

// A concept word as the documents spell it, and the element the engine must
// produce. `literal` is the negative claim - the source marks nothing - and is
// checked as "no formatting element at all", which is what the documents mean
// when they say bare sup/sub is literal text.
const CONCEPTS = [
  ['bold italic', ['<strong>', '<em>']],
  ['italic', ['<em>']],
  ['bold', ['<strong>']],
  ['underline', ['<u>']],
  ['strikethrough', ['<s>']],
  ['strike', ['<s>']],
  ['highlight', ['<mark>']],
  ['superscript', ['<sup>']],
  ['subscript', ['<sub>']],
  ['inline code', ['<code>']],
  ['literal', ['LITERAL']],
]
const MARKUP = ['<em>', '<strong>', '<u>', '<s>', '<mark>', '<sup>', '<sub>']

/** The earliest concept named in a fragment, or null. */
const conceptIn = (text) => {
  const lower = text.toLowerCase()
  let best = null
  for (const [word, tags] of CONCEPTS) {
    const at = lower.indexOf(word)
    if (at === -1) continue
    if (best === null || at < best.at) best = { at, word, tags }
  }
  return best
}

/** Render `source` and return a finding string, or null when the claim holds. */
const check = (where, source, claim, tags) => {
  let html
  try {
    html = carveToHtml(source)
  } catch (error) {
    return `${where}\n    ${JSON.stringify(source)} claims ${JSON.stringify(claim)} but threw: ${String(error.message).split('\n')[0]}`
  }
  if (tags[0] === 'LITERAL') {
    const produced = MARKUP.filter((tag) => html.includes(tag))
    if (produced.length) {
      return `${where}\n    ${JSON.stringify(source)} is documented as LITERAL, but the engine marked it up` +
        `\n    engine rendered: ${JSON.stringify(html.trim())}`
    }
    return null
  }
  const missing = tags.filter((tag) => !html.includes(tag))
  if (missing.length) {
    return `${where}\n    ${JSON.stringify(source)} is documented as ${JSON.stringify(claim)}, so ${missing.join(' and ')} was expected` +
      `\n    engine rendered: ${JSON.stringify(html.trim())}`
  }
  return null
}

const firstCodeSpan = (cell) => {
  const double = /``\s?(.+?)\s?``/.exec(cell)
  if (double) return double[1]
  const single = /`([^`]+)`/.exec(cell)
  return single ? single[1] : null
}

// ---------------------------------------------------------------------------
// ARM 1: the worked examples. A fenced Carve block followed by a fenced `html`
// block is a claim that the first renders to the second, and roughly 26KB of
// references/traps.md is exactly that shape. Nothing ran them.

const fencedBlocks = (text) => {
  const lines = text.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const open = /^(`{3,})([a-z]*)\s*$/.exec(lines[i])
    if (!open) { i++; continue }
    const [, fence, lang] = open
    const startLine = i + 1
    const body = []
    i++
    while (i < lines.length && lines[i].trim() !== fence) { body.push(lines[i]); i++ }
    i++
    out.push({ lang, body: body.join('\n'), startLine })
  }
  return out
}

const workedExamples = () => {
  const pairs = []
  let htmlBlocks = 0
  for (const file of FILES) {
    const blocks = fencedBlocks(read(file))
    for (const b of blocks) if (b.lang === 'html') htmlBlocks++
    for (let k = 0; k + 1 < blocks.length; k++) {
      if (blocks[k].lang === '' && blocks[k + 1].lang === 'html') {
        pairs.push({ file, line: blocks[k].startLine, source: blocks[k].body, claimed: blocks[k + 1].body })
      }
    }
  }
  return { pairs, htmlBlocks }
}

const normalizeHtml = (html) => html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()

test('every worked example renders to the HTML it claims', () => {
  const { pairs } = workedExamples()
  const wrong = []
  for (const { file, line, source, claimed } of pairs) {
    let html
    try {
      html = carveToHtml(source + '\n')
    } catch (error) {
      wrong.push(`${file}:${line} threw: ${String(error.message).split('\n')[0]}`)
      continue
    }
    if (normalizeHtml(html) !== normalizeHtml(claimed)) {
      wrong.push(
        `${file}:${line}\n    source:  ${JSON.stringify(source)}\n` +
        `    claimed: ${JSON.stringify(normalizeHtml(claimed))}\n` +
        `    engine:  ${JSON.stringify(normalizeHtml(html))}`,
      )
    }
  }
  assert.deepEqual(wrong, [], `worked example(s) claim HTML the engine does not produce:\n  ${wrong.join('\n  ')}`)
})

test('every claimed-HTML block belongs to a worked example this test runs', () => {
  // The population guard, derived rather than written down: an `html` block that
  // is NOT preceded by a Carve block is a claim nobody checks, and it would drop
  // out of the arm above in silence. Equality is the assertion, so both a new
  // unreachable block and a pairing this extractor stops recognizing fail here.
  const { pairs, htmlBlocks } = workedExamples()
  assert.equal(
    pairs.length,
    htmlBlocks,
    `the skill holds ${htmlBlocks} claimed-HTML block(s) but only ${pairs.length} are preceded by a ` +
      'Carve source block this test can run. An unpaired HTML block is a claim nothing verifies - ' +
      'put the source immediately before it, or remove it.',
  )
})

// ---------------------------------------------------------------------------
// ARM 2: tables that label a column `Carve`. traps.md trap 4 is the canonical
// statement of the swapped-emphasis rule and it is three columns wide, so the
// syntax.md row reader cannot see it. The column the table itself calls `Carve`
// is the claim; the `Markdown/Djot` column beside it is deliberately NOT Carve
// and must never be executed.

const carveColumnClaims = () => {
  const found = []
  for (const file of FILES) {
    const lines = read(file).split('\n')
    let carveCol = -1
    let effectCol = -1
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim()
      if (!t.startsWith('|') || !t.endsWith('|')) { carveCol = -1; continue }
      const cells = t.slice(1, -1).split('|').map((c) => c.trim())
      const headerAt = cells.findIndex((c) => c.toLowerCase() === 'carve')
      if (headerAt !== -1) { carveCol = headerAt; effectCol = 0; continue }
      if (carveCol === -1) continue
      if (cells.every((c) => /^-*:?-*$/.test(c) || c === '')) continue
      if (cells.length <= carveCol) continue
      const source = firstCodeSpan(cells[carveCol])
      if (source === null) continue
      const concept = conceptIn(cells[effectCol])
      if (!concept) continue
      found.push({ file, line: i + 1, source, claim: cells[effectCol], tags: concept.tags })
    }
  }
  return found
}

test('every Carve-column table claim is true of the engine', () => {
  const claims = carveColumnClaims()
  const wrong = claims
    .map(({ file, line, source, claim, tags }) => check(`${file}:${line}`, source, claim, tags))
    .filter(Boolean)
  assert.deepEqual(wrong, [], `a table column labelled "Carve" states rule(s) the engine does not follow:\n  ${wrong.join('\n  ')}`)
})

// ---------------------------------------------------------------------------
// ARM 3: the rules stated in PROSE. SKILL.md's read-first list is prose, and it
// is the first thing an agent reads, so a contradiction there is the most
// expensive one in the repository.

const proseClaims = () => {
  const found = []
  // The result fragment stops at a COMMA as well as at sentence punctuation.
  // Without that, "`/italic/` is italic (slashes lean), `*bold*` is bold" is one
  // match whose fragment swallows the second claim, so inverting only the bold
  // half would not be read as a claim at all - the arm would pass by not looking.
  const RE = /((?:`[^`\n]+`(?:\s*(?:and|or|\/)\s*)?)+)\s*\b(?:is|are)\b\s+([^.;:,\n]{1,60})/g
  for (const file of FILES) {
    const lines = read(file).split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith('|')) continue
      for (const m of line.matchAll(RE)) {
        const rest = m[2]
        // "are NOT Carve" and friends: a negated claim about a spelling that is
        // not Carve at all. Nothing to render against a concept.
        if (/^\s*(not|no)\b/i.test(rest)) continue
        const concept = conceptIn(rest)
        if (!concept) continue
        // Only the run of code spans immediately before the verb.
        const sources = [...m[1].matchAll(/`([^`\n]+)`/g)].map((s) => s[1])
        for (const source of sources) {
          found.push({ file, line: i + 1, source, claim: rest.trim(), tags: concept.tags })
        }
      }
    }
  }
  return found
}

test('every formatting rule stated in prose is true of the engine', () => {
  const claims = proseClaims()
  const wrong = claims
    .map(({ file, line, source, claim, tags }) => check(`${file}:${line}`, source, claim, tags))
    .filter(Boolean)
  assert.deepEqual(wrong, [], `the skill states rule(s) in prose that the engine does not follow:\n  ${wrong.join('\n  ')}`)
})

// ---------------------------------------------------------------------------
// Coverage: a rule that stops being extractable must fail rather than vanish.

test('no documented concept has dropped out of the tables and prose', () => {
  const exercised = new Set([...carveColumnClaims(), ...proseClaims()].flatMap(({ tags }) => tags))
  const WANTED = ['<em>', '<strong>', '<u>', '<s>', '<mark>', '<sup>', '<sub>', 'LITERAL']
  const missing = WANTED.filter((tag) => !exercised.has(tag))
  assert.deepEqual(
    missing,
    [],
    `no table or prose claim outside references/syntax.md exercises ${missing.join(', ')} any more. ` +
      'Rewording a rule past recognition removes the claim instead of falsifying it, which reads ' +
      'as a pass - so the concept going unexercised is itself the failure.',
  )
})
