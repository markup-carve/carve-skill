// Compare a divergence document against the recorded review and exit nonzero if
// any numbered section moved:
//
//   node scripts/check-spec-review.mjs [path/to/divergence-from-djot.md]
//
// Defaults to the PINNED copy, which is what `npm test` asserts. The scheduled
// spec-drift workflow points it at a fresh clone of carve main instead - the
// pinned copy cannot report that the pin itself has fallen behind, which is the
// blindness that made #4 possible.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sectionFingerprints, compareSections, describeFindings } from './spec-sections.mjs'
import { shortfall } from './participants.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const specDoc = process.argv[2] ?? join(root, 'spec', 'docs', 'divergence-from-djot.md')
const review = JSON.parse(readFileSync(join(root, 'test', 'spec-review.json'), 'utf8'))

const current = sectionFingerprints(readFileSync(specDoc, 'utf8'))

// The comparison below only reports on a document it could parse. A restructured
// or truncated one produces no sections at all, and the recorded review is what
// turns that into "16 removed" rather than a clean run - which is a gate leaning
// on its ledger being non-empty (markup-carve/carve#755). Said directly here, so
// the message names the cause instead of listing every section as deleted. This
// runs against a FRESH CLONE of carve main in the scheduled workflow, where a
// half-fetched checkout is a real way to arrive at zero.
const thin = shortfall({
  label: 'DIVERGENCES',
  actual: Object.keys(current).length,
  atLeast: 10,
  of: `numbered section(s) parsed from ${specDoc}`,
  hint: 'the document is missing, truncated, or no longer uses "## N. Title" headings.',
})
if (thin) {
  process.stdout.write(`${thin}\n`)
  process.exit(1)
}

const findings = compareSections(review.sections, current)

if (findings.length === 0) {
  process.stdout.write(`${specDoc}: all ${Object.keys(review.sections).length} sections match the recorded review\n`)
  process.exit(0)
}

process.stdout.write(
  `${specDoc}: ${findings.length} divergence section(s) moved since the trap list was last read against them:\n` +
    `${describeFindings(findings)}\n\n` +
    'Re-read those sections, check references/traps.md still tells the truth about each,\n' +
    'then record the review with `npm run spec:review`.\n',
)
process.exit(1)
