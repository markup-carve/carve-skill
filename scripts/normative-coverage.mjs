// ONE LEDGER PAIR OVER THREE FILES, AND WHY THAT IS ENOUGH - CHECKED, NOT CLAIMED.
//
// The spec states its normative rules across three surfaces:
// resources/spec/rules.json (the registry of ids, parts and titles),
// resources/normative-clauses.txt (the inventory the grammar generates), and
// docs/rules/ (six views generated from the registry). Two ledgers watch the
// registry and the grammar text behind it. Nothing watches the other two,
// because they carry no rule those two do not - and that sentence is only worth
// something while it is true.
//
// So it is measured here rather than asserted, against whichever spec checkout
// is being examined: `npm test` runs this over the pinned submodule, and the
// scheduled workflow runs it over a fresh clone of carve main through
// scripts/check-spec-review.mjs. If the spec ever lets the surfaces diverge, the
// claim fails out loud instead of the guard going quietly partial.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { clauseFingerprints, inventoryTitles } from './normative-clauses.mjs'
import { shortfall } from './participants.mjs'

const RULES = 'resources/spec/rules.json'
const INVENTORY = 'resources/normative-clauses.txt'
const GRAMMAR = 'resources/grammar.ebnf'
const VIEWS = join('docs', 'rules')
// A generated view row: the rule id, then two more cells. In a scope view they
// are the PART and the clause title; in the retired table of the index they are
// the last title and the document that replaced the rule.
const RULE_ROW = /^\|\s*`(CARVE-[A-Z0-9]+-\d{3})`\s*\|([^|]*)\|([^|]*)\|/gm
const FLOOR = 200

/**
 * @param {string} checkout a spec checkout root
 * @returns {string[]} one line per finding, empty when the coverage claim holds
 */
export function coverageFindings(checkout) {
  const findings = []
  const read = (path) => readFileSync(join(checkout, path), 'utf8')

  let registry
  try {
    registry = JSON.parse(read(RULES))
  } catch (error) {
    return [`${RULES}: ${error.message}`]
  }
  if (!Array.isArray(registry.rules)) return [`${RULES}: no rules array`]

  const tally = (titles) => {
    const counts = new Map()
    for (const title of titles) counts.set(title, (counts.get(title) ?? 0) + 1)
    return [...counts].sort(([a], [b]) => a.localeCompare(b))
  }
  const held = tally(registry.rules.map((rule) => rule.title))

  const inventory = inventoryTitles(read(INVENTORY))
  if (inventory.malformed > 0) {
    findings.push(
      `${INVENTORY}: ${inventory.malformed} line(s) are not "<count> TITLE" - the inventory ` +
        'changed shape, and this comparison no longer reads it',
    )
  }
  findings.push(
    ...floor('CLAUSE INVENTORY', inventory.titles.length, `clause heading(s) in ${INVENTORY}`),
  )
  findings.push(
    ...disagree(
      inventory.titles,
      held,
      `${INVENTORY} and ${RULES} no longer hold the same clauses, so watching the registry no ` +
        'longer watches the inventory',
    ),
  )

  const clauses = Object.values(clauseFingerprints(read(GRAMMAR))).map((clause) => clause.title)
  findings.push(...floor('GRAMMAR CLAUSES', clauses.length, `normative clause(s) in ${GRAMMAR}`))
  findings.push(
    ...disagree(
      tally(clauses),
      inventory.titles,
      `the clauses scripts/normative-clauses.mjs finds in ${GRAMMAR} are not the ones ${INVENTORY} ` +
        'names, so the clause-body ledger reads a different document than the spec generates from',
    ),
  )

  const active = new Set(registry.rules.map((rule) => rule.id))
  const retired = new Map((registry.retired ?? []).map((rule) => [rule.id, rule.title]))
  let views = []
  try {
    views = readdirSync(join(checkout, VIEWS)).filter((name) => name.endsWith('.md'))
  } catch (error) {
    return [...findings, `${VIEWS}: ${error.message}`]
  }
  if (views.length < 5) findings.push(`${VIEWS}: ${views.length} view(s), expected at least 5`)

  // Whole ROWS, counted. Unique ids would pass a view that keeps an id and a
  // stale part or title beside it, and a rule listed in two views - and the
  // index claims the views carry every active rule exactly once.
  const rows = []
  const unknown = []
  const staleRetired = []
  for (const view of views) {
    for (const match of read(join(VIEWS, view)).matchAll(RULE_ROW)) {
      const [, id, second, third] = match
      if (active.has(id)) {
        rows.push(`${id}\0${second.trim().replace(/`/g, '')}\0${third.trim()}`)
      } else if (retired.has(id)) {
        if (second.trim() !== retired.get(id)) {
          staleRetired.push(`${view}: ${id} is listed as "${second.trim()}"`)
        }
      } else {
        unknown.push(`${view}: ${id}`)
      }
    }
  }

  findings.push(...floor('RULE VIEWS', rows.length, `rule row(s) in ${VIEWS}`))
  if (unknown.length > 0) {
    findings.push(
      `${VIEWS} cites rule id(s) the registry does not carry, so the views are no longer ` +
        `generated from ${RULES}: ${unknown.join(', ')}`,
    )
  }
  if (staleRetired.length > 0) {
    findings.push(
      `${VIEWS} names a retired rule under a title ${RULES} does not give it: ` +
        `${staleRetired.join('; ')}`,
    )
  }

  const expected = registry.rules.map((rule) => `${rule.id}\0${rule.part}\0${rule.title}`)
  findings.push(
    ...disagree(
      tally(rows),
      tally(expected),
      `the rule rows under ${VIEWS} are not the rules ${RULES} holds, so the views are no longer ` +
        'generated from it and reading the registry is no longer reading them',
    ),
  )
  return findings
}

function floor(label, actual, of) {
  const thin = shortfall({
    label,
    actual,
    atLeast: FLOOR,
    of,
    hint: 'the document is missing, truncated, or changed shape - over an empty list the ' +
      'comparisons here hold no matter what the other surfaces say.',
  })
  return thin ? [thin] : []
}

function disagree(left, right, because) {
  if (JSON.stringify(left) === JSON.stringify(right)) return []
  const names = (pairs) =>
    new Set(pairs.map(([entry, count]) => `${count}x ${entry.split('\0').join(' | ')}`))
  const a = names(left)
  const b = names(right)
  const only = (from, other) => [...from].filter((entry) => !other.has(entry)).slice(0, 10)
  return [
    `${because}. Only on the first side: ${only(a, b).join('; ') || '(none)'}. ` +
      `Only on the second: ${only(b, a).join('; ') || '(none)'}. ` +
      'Give the surface its own ledger in scripts/review-ledgers.mjs.',
  ]
}
