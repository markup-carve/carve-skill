// One spelling of "what is an AST node definition, and has it changed", the
// schema counterpart to spec-sections.mjs. Shared by the offline drift guard
// (against the pinned spec) and the scheduled workflow (against carve main).
//
// Why this exists at all: the guard used to read exactly two documents out of
// the spec, docs/divergence-from-djot.md and docs/cheatsheet.md. Anything not
// named was invisible, so a rule stated in resources/ast-schema.json could be
// rewritten - or inverted - and every gate in this repository stayed green.
// Measured on pin be6e7cc6 -> cc06bb5, which broadened the `image` node's
// block-position rule to cover both reference spellings and passed silently.

import { createHash } from 'node:crypto'

// The whole schema minus `$defs`: title, description, the root `$ref`, and the
// identifying keys. A node definition is not the only place the schema states a
// rule, and an envelope that stopped naming the document root would be exactly
// the kind of move a name-keyed ledger cannot report. `$` cannot begin a node
// name, so this key can never collide with one.
export const ENVELOPE = '$envelope'

/**
 * Fingerprint every node definition of `resources/ast-schema.json`.
 *
 * Each definition is hashed over a CANONICAL serialization - keys sorted at
 * every level - so a re-serialization that reorders properties does not demand
 * a re-review, while any change to a description, a required list, a const or a
 * property shape does. That is the JSON analogue of the whitespace
 * normalization sectionFingerprints applies to prose.
 *
 * @param {string} text the AST schema document
 * @returns {Record<string, {title: string, sha256: string}>} keyed by node name
 */
export function nodeFingerprints(text) {
  let schema
  try {
    schema = JSON.parse(text)
  } catch (cause) {
    throw new Error(`resources/ast-schema.json is not valid JSON: ${cause.message}`, { cause })
  }
  if (schema === null || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new Error('resources/ast-schema.json does not hold a JSON object')
  }

  const { $defs: defs, ...envelope } = schema
  const nodes = {}

  for (const [name, def] of Object.entries(defs ?? {})) {
    nodes[name] = {
      title: typeof def?.title === 'string' ? def.title : name,
      sha256: fingerprint(def),
    }
  }

  nodes[ENVELOPE] = {
    title: typeof schema.title === 'string' ? schema.title : 'AST schema envelope',
    sha256: fingerprint(envelope),
  }

  return nodes
}

function fingerprint(value) {
  return createHash('sha256').update(canonical(value)).digest('hex')
}

/**
 * Deterministic JSON: object keys sorted, everything else structurally intact.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const body = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(',')
    return `{${body}}`
  }
  return JSON.stringify(value) ?? 'null'
}
