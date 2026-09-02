// Fingerprint the spec's normative rule registry, `resources/spec/rules.json`.
//
// The registry is the structured source of the whole normative surface: the
// grammar's clause inventory (`resources/normative-clauses.txt`) is its title
// set, and the six views under `docs/rules/` are generated from it. Watching it
// therefore watches all three, which test/drift.test.mjs asserts rather than
// assumes.
//
// WHAT IS IN THE FINGERPRINT, AND WHY THAT AND NOT MORE. A rule is identified by
// its id, so a reordered or renumbered registry reports nothing, and hashed over
// PART plus TITLE, so a retitled or relocated clause reports. `scope` is
// deliberately excluded: docs/rules/index.md calls the views navigation that
// "do not define conformance profiles or make any rule optional", and measured
// across pin b5b603d2 -> f59cc880, including it turned the one-off introduction
// of the scope field into 242 findings for zero change in any rule's text. A
// ledger that fails on every pin bump gets recorded without reading, which is
// worse than not having one. Over the same window the shipped fingerprint
// reports 23: 7 added, 3 removed, 13 retitled.

import { createHash } from 'node:crypto'

/**
 * Fingerprint every active rule of the normative registry, keyed by rule id.
 *
 * @param {string} text the registry JSON
 * @returns {Record<string, {title: string, sha256: string}>}
 */
export function ruleFingerprints(text) {
  const registry = JSON.parse(text)
  const rules = registry.rules
  if (!Array.isArray(rules)) {
    throw new Error('resources/spec/rules.json has no `rules` array — the registry moved or was restructured')
  }

  const fingerprints = {}
  for (const rule of rules) {
    // A rule the parser cannot key is a rule the ledger would drop silently,
    // which is the blind spot this ledger exists to remove — so it is an error,
    // not a skip.
    if (typeof rule?.id !== 'string' || rule.id === '') {
      throw new Error(`a rule in resources/spec/rules.json has no id: ${JSON.stringify(rule)}`)
    }
    if (Object.hasOwn(fingerprints, rule.id)) {
      throw new Error(`resources/spec/rules.json carries ${rule.id} twice — one of them would be invisible to the ledger`)
    }
    const title = typeof rule.title === 'string' ? rule.title : ''
    const part = typeof rule.part === 'string' ? rule.part : String(rule.part ?? '')
    fingerprints[rule.id] = {
      title,
      sha256: createHash('sha256').update(`${part}\n${title}\n`).digest('hex'),
    }
  }
  return fingerprints
}
