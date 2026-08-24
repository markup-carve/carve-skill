// One spelling of "what is a row of the cheat sheet, and has it changed", the
// syntax-card counterpart to spec-sections.mjs and schema-nodes.mjs. Shared by
// the offline drift guard (against the pinned spec) and the scheduled workflow
// (against carve main).
//
// Why this exists at all: docs/cheatsheet.md was READ, but only for whether
// certain tokens were PRESENT - `cheat.includes('{,sub,}')` and twelve more.
// Presence is not meaning. The row
//
//     | `{,sub,}` | subscript | commas pull down |
//
// can have its Get and Mnemonic columns rewritten into the opposite rule, or
// its Write column extended with a qualification that inverts it, and every
// `includes` still finds the token, so the drift guard, `npm test` and the
// scheduled workflow all stay green (markup-carve/carve-skill#89). That is the
// same defect as #84 one document over: a check that cannot detect what it
// claims to detect.
//
// So the card is fingerprinted per ROW instead. The parse is TOTAL - every line
// of the document lands in exactly one entry, including the prose between the
// tables and the notation fences - because a ledger that covers most of a
// document has the same blind spot in miniature: whatever it does not cover
// moves silently.

import { createHash } from 'node:crypto'

const HEADING = /^(#{1,6}) (.+)$/
const FENCE = /^([`~]{3,})(.*)$/
// A pipe-table delimiter row: |---|:--:|. It carries alignment, not meaning the
// skill teaches, and it moves whenever a column is re-padded.
const DELIMITER = /^\|[\s:|-]*-[\s:|-]*\|$/

// Everything before the first section heading: the frontmatter, the title and
// the opening prose. A `#` cannot begin a section label produced below, so this
// can never collide with one.
export const PREAMBLE = '#preamble'

/**
 * Fingerprint every row of `docs/cheatsheet.md`.
 *
 * An entry is one meaning-bearing unit of the card:
 *
 *   - a table row, keyed by its first cell - the construct it teaches;
 *   - a fenced block, keyed by its position and info string;
 *   - a run of prose between them, keyed by its position.
 *
 * Table rows are normalized cell by cell, so re-padding a column to line up a
 * new row does not demand a re-review while any change to what a cell SAYS
 * does. That is the table analogue of the whitespace normalization
 * sectionFingerprints applies to prose and the key sorting nodeFingerprints
 * applies to JSON.
 *
 * @param {string} text the cheat sheet document
 * @returns {Record<string, {title: string, sha256: string}>} keyed by entry label
 */
export function rowFingerprints(text) {
  const entries = {}
  for (const row of parseRows(text)) {
    entries[row.key] = { title: row.title, sha256: fingerprint(row.body) }
  }
  return entries
}

/**
 * The parse behind {@link rowFingerprints}, with the source line numbers each
 * entry was built from.
 *
 * Split out so the totality claim above is CHECKABLE rather than asserted in a
 * comment: test/drift.test.mjs walks these spans and fails if any line of the
 * card belongs to no entry, or to two. A comment saying "every line is covered"
 * is exactly the kind of claim that stops being true a document revision later
 * and takes the guard's meaning with it.
 *
 * @param {string} text the cheat sheet document
 * @returns {Array<{key: string, title: string, body: string, lines: number[]}>}
 *   in document order; `lines` holds the zero-based source line numbers
 */
export function parseRows(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const rows = []
  const taken = new Set()
  let section = PREAMBLE
  let counters = { fence: 0, prose: 0, table: 0 }
  let prose = []
  let proseLines = []

  const put = (label, title, body, covered) => {
    let key = `${section} / ${label}`
    // A construct can legitimately be taught by two rows of one section (the
    // card spells the backslash twice). Distinct keys keep both fingerprinted;
    // silently overwriting one would drop a row from the ledger, which is the
    // failure this file exists to make impossible.
    for (let n = 2; taken.has(key); n += 1) key = `${section} / ${label} #${n}`
    taken.add(key)
    rows.push({ key, title, body, lines: covered })
  }

  const flushProse = () => {
    if (prose.some((l) => l.trim() !== '')) {
      counters.prose += 1
      put(`prose ${counters.prose}`, summarize(prose), prose.join('\n'), proseLines)
    }
    prose = []
    proseLines = []
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    const heading = HEADING.exec(line)
    if (heading) {
      flushProse()
      // Only `##` opens a section. A deeper heading stays inside the section it
      // is written under and is fingerprinted there as prose, so moving one
      // does not silently re-key every entry below it.
      if (heading[1] === '##') {
        section = heading[2].trim()
        counters = { fence: 0, prose: 0, table: 0 }
        put('heading', section, line, [i])
        continue
      }
      prose.push(line)
      proseLines.push(i)
      continue
    }

    const fence = FENCE.exec(line)
    if (fence) {
      flushProse()
      const [, marker, info] = fence
      const char = marker[0]
      const body = [line]
      const covered = [i]
      i += 1
      // Closed by a fence of the SAME character and at least the same length,
      // which is what lets the card wrap a three-backtick sample in a
      // four-backtick block without the parser stopping at the sample.
      for (; i < lines.length; i += 1) {
        body.push(lines[i])
        covered.push(i)
        const closer = FENCE.exec(lines[i])
        if (
          closer &&
          closer[1][0] === char &&
          closer[1].length >= marker.length &&
          closer[2].trim() === ''
        ) {
          break
        }
      }
      counters.fence += 1
      const tag = info.trim() === '' ? 'plain' : info.trim()
      put(`fence ${counters.fence} (${tag})`, `${tag} block`, body.join('\n'), covered)
      continue
    }

    if (line.startsWith('|')) {
      flushProse()
      const cells = splitRow(line)
      // A delimiter row carries alignment, and nothing else. Fingerprinting the
      // dashes would demand a re-review every time a column is re-padded to fit
      // a new row, which trains a reviewer to re-record without reading - the
      // way a guard stops meaning anything without ever going red.
      if (DELIMITER.test(line.trim())) {
        const aligns = cells.map(alignment)
        put(`delimiter ${counters.table + 1}`, aligns.join(' | '), aligns.join(' | '), [i])
        counters.table += 1
        continue
      }
      put(`row: ${cells[0] || '(empty)'}`, cells.join(' | '), cells.join(' | '), [i])
      continue
    }

    prose.push(line)
    proseLines.push(i)
  }
  flushProse()

  return rows
}

/**
 * A table row's cells, outer pipes dropped and each cell whitespace-normalized.
 *
 * Splitting on every pipe would cut a cell that legitimately holds one, and the
 * card's own rows teach the pipe-table markers, so a pipe inside a code span or
 * behind a backslash stays part of its cell.
 *
 * Padding is collapsed OUTSIDE code spans only. Inside one it is the sample,
 * and in Carve the width of a run is frequently the whole point - `1. ` is a
 * content column of 3 and `1.  ` is not - so collapsing it there would let the
 * card change what it teaches with the fingerprint unmoved, which is the defect
 * this file exists to close rather than a smaller version of it to accept.
 *
 * @param {string} line
 * @returns {string[]}
 */
export function splitRow(line) {
  const cells = []
  // A cell is built as alternating segments so the collapse below can be
  // applied to the layout and withheld from the samples, rather than to the
  // assembled string where the two are no longer distinguishable.
  let parts = [{ code: false, text: '' }]
  let ticks = 0

  const add = (text) => {
    parts[parts.length - 1].text += text
  }
  const open = (code) => {
    parts.push({ code, text: '' })
  }
  const finish = () => {
    const text = parts
      .map((part) => (part.code ? part.text : part.text.replace(/\s+/g, ' ')))
      .join('')
    // Trimming the ends cannot reach into a code span: a span starts and ends
    // with a backtick, so an edge blank is always outside one.
    cells.push(text.trim())
    parts = [{ code: false, text: '' }]
  }

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    // A backslash escapes the next character, but NOT inside a code span -
    // there it is literal, and the card has a row whose first cell is a code
    // span holding exactly one backslash. Reading it as an escape swallows the
    // closing backtick, leaves the span open for the rest of the line, and
    // folds the whole row into a single cell.
    if (ch === '\\' && ticks === 0 && i + 1 < line.length) {
      add(ch + line[i + 1])
      i += 1
      continue
    }
    if (ch === '`') {
      let run = 0
      while (line[i + run] === '`') run += 1
      // A delimiter belongs to the span it bounds, so the opening run starts
      // the code segment and the closing run ends it.
      if (ticks === 0) {
        ticks = run
        open(true)
        add('`'.repeat(run))
      } else if (ticks === run) {
        ticks = 0
        add('`'.repeat(run))
        open(false)
      } else {
        add('`'.repeat(run))
      }
      i += run - 1
      continue
    }
    if (ch === '|' && ticks === 0) {
      finish()
      continue
    }
    add(ch)
  }
  finish()

  // The leading and trailing pipes each produce an empty cell.
  if (cells.length > 1 && cells[0] === '') cells.shift()
  if (cells.length > 1 && cells[cells.length - 1] === '') cells.pop()
  return cells
}

/**
 * What a pipe-table delimiter cell says, with the width thrown away.
 *
 * @param {string} cell
 * @returns {string}
 */
function alignment(cell) {
  const left = cell.startsWith(':')
  const right = cell.endsWith(':')
  if (left && right) return 'center'
  if (left) return 'left'
  if (right) return 'right'
  return 'default'
}

function summarize(lines) {
  const text = (lines.find((l) => l.trim() !== '') ?? '').trim()
  return text.length > 72 ? `${text.slice(0, 69)}...` : text
}

function fingerprint(body) {
  const normalized = body
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return createHash('sha256').update(`${normalized}\n`).digest('hex')
}
