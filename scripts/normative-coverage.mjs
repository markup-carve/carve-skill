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
const RULE_ID = /`(CARVE-[A-Z0-9]+-\d{3})`/g
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

  const active = registry.rules.map((rule) => rule.id)
  const known = new Set([...active, ...(registry.retired ?? []).map((rule) => rule.id)])
  const seen = new Set()
  const unknown = []
  let views = []
  try {
    views = readdirSync(join(checkout, VIEWS)).filter((name) => name.endsWith('.md'))
  } catch (error) {
    return [...findings, `${VIEWS}: ${error.message}`]
  }
  if (views.length < 5) findings.push(`${VIEWS}: ${views.length} view(s), expected at least 5`)
  for (const view of views) {
    for (const match of read(join(VIEWS, view)).matchAll(RULE_ID)) {
      seen.add(match[1])
      if (!known.has(match[1])) unknown.push(`${view}: ${match[1]}`)
    }
  }
  findings.push(...floor('RULE VIEWS', seen.size, `rule id(s) cited across ${VIEWS}`))
  if (unknown.length > 0) {
    findings.push(
      `${VIEWS} cites rule id(s) the registry does not carry, so the views are no longer ` +
        `generated from ${RULES}: ${unknown.join(', ')}`,
    )
  }
  // The other direction. A floor cannot see dozens of omissions, and the index
  // claims the views cover every active rule exactly once.
  const missing = active.filter((id) => !seen.has(id))
  if (missing.length > 0) {
    findings.push(
      `${missing.length} active rule id(s) appear in ${RULES} but in no view under ${VIEWS}, so ` +
        `reading the registry is no longer reading the views: ${missing.slice(0, 10).join(', ')}`,
    )
  }
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
  const names = (pairs) => new Set(pairs.map(([title, count]) => `${count}x ${title}`))
  const a = names(left)
  const b = names(right)
  const only = (from, other) => [...from].filter((entry) => !other.has(entry)).slice(0, 10)
  return [
    `${because}. Only on the first side: ${only(a, b).join('; ') || '(none)'}. ` +
      `Only on the second: ${only(b, a).join('; ') || '(none)'}. ` +
      'Give the surface its own ledger in scripts/review-ledgers.mjs.',
  ]
}
