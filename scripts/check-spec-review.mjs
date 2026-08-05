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

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const specDoc = process.argv[2] ?? join(root, 'spec', 'docs', 'divergence-from-djot.md')
const review = JSON.parse(readFileSync(join(root, 'test', 'spec-review.json'), 'utf8'))

const findings = compareSections(review.sections, sectionFingerprints(readFileSync(specDoc, 'utf8')))

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
