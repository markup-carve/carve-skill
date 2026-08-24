// THE LIST OF WHAT THE DRIFT GUARD WATCHES.
//
// A guard that enumerates its inputs by name can only see what is named, and
// anything else in the spec moves silently. That is not a hypothetical: for the
// repository's whole history until markup-carve/carve-skill#84 this list was two
// paths spelled inline in test/drift.test.mjs, and resources/ast-schema.json -
// where the AST node rules live - was not one of them. A pin bump rewrote the
// `image` node's block-position rule and every gate stayed green.
//
// So the list lives here, once, and the test, the offline checker and the
// scheduled workflow all read it. Adding a document to the guard is adding an
// entry here; the failure of omission is at least visible in one place.

import { join } from 'node:path'
import { nodeFingerprints } from './schema-nodes.mjs'
import { sectionFingerprints } from './spec-sections.mjs'

/**
 * Where the pinned spec is checked out inside this repository.
 *
 * @param {string} repoRoot
 * @returns {string}
 */
export function specRoot(repoRoot) {
  return join(repoRoot, 'spec')
}

export const LEDGERS = [
  {
    id: 'divergences',
    source: 'docs/divergence-from-djot.md',
    reviewFile: 'spec-review.json',
    entries: 'sections',
    kind: 'section',
    label: 'DIVERGENCES',
    // A parse that yields far too few entries is a runner that compared almost
    // nothing, and an empty ledger comparison passes trivially
    // (markup-carve/carve#755). The floors sit well under the real counts so a
    // legitimate edit never trips them; they catch a missing, truncated or
    // restructured document.
    atLeast: 10,
    of: 'numbered section(s)',
    hint: 'the document is missing, truncated, or no longer uses "## N. Title" headings.',
    fingerprint: sectionFingerprints,
    reread: 'Re-read those sections of spec/docs/divergence-from-djot.md, check the matching\n' +
      'section of references/traps.md still tells the truth, then run `npm run spec:review`.',
    comment:
      'Which spec divergence sections the trap list in references/traps.md was last read ' +
      'against. Regenerate with `npm run spec:review` AFTER re-reading the sections the ' +
      'drift guard names - see README, "Not drifting".',
  },
  {
    id: 'ast-schema',
    source: 'resources/ast-schema.json',
    reviewFile: 'schema-review.json',
    entries: 'nodes',
    kind: 'node',
    label: 'AST NODES',
    atLeast: 40,
    of: 'node definition(s)',
    hint: 'the document is missing, truncated, or no longer keeps its node definitions under `$defs`.',
    fingerprint: nodeFingerprints,
    reread: 'Re-read those nodes of spec/resources/ast-schema.json, check that no reference page\n' +
      'now states the old rule, then run `npm run spec:review`.',
    comment:
      'Which AST node definitions of spec/resources/ast-schema.json the skill was last read ' +
      'against. The schema states language rules in prose - block promotion, resolution ' +
      'timing, which fields survive - so a moved description can make a reference page lie. ' +
      'Regenerate with `npm run spec:review` AFTER re-reading the nodes the drift guard ' +
      'names - see README, "Not drifting".',
  },
]
