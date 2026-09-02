// Fingerprint the TEXT of every normative clause in `resources/grammar.ebnf`.
//
// resources/spec/rules.json is the registry of what the rules ARE - id, part,
// title - and scripts/normative-rules.mjs watches that. It carries no rule text,
// so under it a clause can be rewritten into the opposite rule with its title
// untouched and nothing reports. That is markup-carve/carve#455 exactly, one
// document over: the spec inverted the container rule inside divergence section
// 13 and left the heading numbered 13, and every gate stayed green until the
// ledger started fingerprinting section BODIES.
//
// KEYED BY TITLE, NOT BY A DERIVED ID. The registry's ids are stable and stored;
// the grammar's clause ORDER is not, and the spec's own checker compares the two
// on part and title alone (spec/scripts/spec-rules.mjs). Measured at pin
// 2775b6df, deriving ids positionally the way that script's generator does puts
// "AT OR PAST MEANS THE DEEPEST COLUMN THE LINE REACHES" at CARVE-P0-012 while
// the registry calls it CARVE-P0-020 - two clauses inserted earlier in PART 0
// shifted every later position. A ledger keyed that way would report most of a
// part as changed for one insertion.
//
// The marker spelling is the spec's own, from that script, so the two do not
// disagree about what a normative clause is. test/drift.test.mjs pins the result
// against resources/normative-clauses.txt, the inventory the spec generates from
// the same markers, so a copy that drifts fails instead of quietly matching
// fewer clauses.

import { createHash } from 'node:crypto'

const MARKER = /([A-Z][A-Za-z0-9 ,§`(){}'/+.:[\]-]{3,240}?)\s+--\s+NORMATIVE/g

/**
 * Fingerprint every normative clause of the grammar, keyed by clause title.
 *
 * The grammar is flattened first - every newline and its following indent
 * become one space - so re-wrapping a paragraph is not a change, and a clause
 * body is simply the text between its own marker and the next one.
 *
 * @param {string} text the grammar
 * @returns {Record<string, {title: string, sha256: string}>}
 */
export function clauseFingerprints(text) {
  const flat = text.replace(/\r\n/g, '\n').replace(/\n\s*/g, ' ')
  const markers = [...flat.matchAll(MARKER)]

  const clauses = {}
  markers.forEach((marker, index) => {
    const title = marker[1]
      .trim()
      .replace(/\s+/g, ' ')
      .split(/(?<=\.)\)?\s+/)
      .at(-1)
      .replace(/^\d+[a-z]?\.\s*/, '')
      .replace(/^-\s+/, '')
    const body = flat
      .slice(marker.index + marker[0].length, markers[index + 1]?.index ?? flat.length)
      .trim()

    // Three titles are carried by two clauses each, in different PARTs. An
    // occurrence suffix keeps both, in grammar order; silently keeping one is
    // the blind spot the ledger exists to remove.
    let label = title
    for (let occurrence = 2; Object.hasOwn(clauses, label); occurrence += 1) {
      label = `${title} #${occurrence}`
    }
    clauses[label] = {
      title,
      sha256: createHash('sha256').update(`${title}\n\n${body}\n`).digest('hex'),
    }
  })
  return clauses
}

/**
 * The clause titles the spec's own inventory claims, as a multiset.
 *
 * @param {string} text `resources/normative-clauses.txt`
 * @returns {{titles: Array<[string, number]>, malformed: number}}
 */
export function inventoryTitles(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'))
    .map((line) => /^(\d+)\s+(.+)$/.exec(line.trimEnd()))

  const counts = new Map()
  for (const line of lines) {
    if (line === null) continue
    const title = line[2].trim()
    counts.set(title, (counts.get(title) ?? 0) + Number(line[1]))
  }
  return {
    titles: [...counts].sort(([a], [b]) => a.localeCompare(b)),
    malformed: lines.filter((line) => line === null).length,
  }
}
