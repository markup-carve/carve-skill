// Compare a spec checkout against the recorded reviews and exit nonzero if any
// watched entry moved:
//
//   node scripts/check-spec-review.mjs [path/to/spec/checkout]
//
// Defaults to the PINNED submodule, which is what `npm test` asserts. The
// scheduled spec-drift workflow points it at a fresh clone of carve main
// instead - the pinned copy cannot report that the pin itself has fallen
// behind, which is the blindness that made #4 possible.
//
// Every document in scripts/review-ledgers.mjs is checked, not just the
// divergence prose: naming inputs one at a time is what left the AST schema
// unwatched (#84).

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverageFindings } from './normative-coverage.mjs'
import { LEDGERS, specRoot } from './review-ledgers.mjs'
import { compareSections, describeFindings } from './spec-sections.mjs'
import { shortfall } from './participants.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const argument = process.argv[2]

// This script used to take the divergence DOCUMENT; it now takes the checkout
// that holds every watched document. Say so, rather than letting a stale caller
// fail on a path with `docs/divergence-from-djot.md` in it twice.
if (argument && /\.(md|json)$/.test(argument)) {
  process.stdout.write(
    `${argument}: this checker takes the SPEC CHECKOUT directory, not a single document ` +
      '- it compares every ledger in scripts/review-ledgers.mjs.\n',
  )
  process.exit(2)
}

const checkout = argument ?? specRoot(root)
let failed = false

for (const ledger of LEDGERS) {
  if (!check(ledger)) failed = true
}

// Whether the ledgers still COVER the normative surface is a question about the
// checkout in hand, not about this repository's pin - the spec can restructure
// resources/normative-clauses.txt or docs/rules/ at main with the pin here
// unmoved, and `npm test` reads the pinned copy only.
if (!coverage(checkout)) failed = true

process.exit(failed ? 1 : 0)

/**
 * @param {string} root a spec checkout
 * @returns {boolean} true when the ledgers still cover the normative surface
 */
function coverage(root) {
  let findings
  try {
    findings = coverageFindings(root)
  } catch (error) {
    process.stdout.write(`normative rule surface: ${error.message}\n`)
    return false
  }
  if (findings.length === 0) {
    process.stdout.write(
      'normative rule surface: the clause inventory, the grammar and the generated views all ' +
        'agree with the rules registry\n',
    )
    return true
  }
  process.stdout.write(`normative rule surface: ${findings.length} finding(s):\n`)
  for (const finding of findings) process.stdout.write(`  ${finding}\n`)
  return false
}

/**
 * @param {(typeof LEDGERS)[number]} ledger
 * @returns {boolean} true when the recorded review is still current
 */
function check(ledger) {
  const document = join(checkout, ledger.source)
  const recorded = JSON.parse(readFileSync(join(root, 'test', ledger.reviewFile), 'utf8'))[
    ledger.entries
  ]

  // The RECORDED side is counted first. An empty ledger reports every entry as
  // "added" and exits nonzero, so it does not pass - but it says the spec moved
  // when what actually happened is that this repository has no review on file.
  const empty = shortfall({
    label: `${ledger.label} (recorded)`,
    actual: Object.keys(recorded ?? {}).length,
    atLeast: ledger.atLeast,
    of: `${ledger.of} in test/${ledger.reviewFile}`,
    hint: 'the ledger is missing or empty - run `npm run spec:review`.',
  })
  if (empty) {
    process.stdout.write(`${empty}\n`)
    return false
  }

  let current
  try {
    current = ledger.fingerprint(readFileSync(document, 'utf8'))
  } catch (error) {
    process.stdout.write(`${document}: ${error.message}\n`)
    return false
  }

  // The comparison below only reports on a document it could parse. A
  // restructured or truncated one produces no entries at all, and the recorded
  // review is what turns that into "16 removed" rather than a clean run - which
  // is a gate leaning on its ledger being non-empty (markup-carve/carve#755).
  // Said directly here, so the message names the cause instead of listing every
  // entry as deleted. This runs against a FRESH CLONE of carve main in the
  // scheduled workflow, where a half-fetched checkout is a real way to arrive
  // at zero.
  const thin = shortfall({
    label: ledger.label,
    actual: Object.keys(current).length,
    atLeast: ledger.atLeast,
    of: `${ledger.of} parsed from ${document}`,
    hint: ledger.hint,
  })
  if (thin) {
    process.stdout.write(`${thin}\n`)
    return false
  }

  const findings = compareSections(recorded, current)

  if (findings.length === 0) {
    process.stdout.write(
      `${document}: all ${Object.keys(recorded).length} ${ledger.kind}s match the recorded review\n`,
    )
    return true
  }

  process.stdout.write(
    `${document}: ${findings.length} ${ledger.kind}(s) moved since the skill was last read against them:\n` +
      `${describeFindings(findings, ledger.kind)}\n\n${ledger.reread}\n`,
  )
  return false
}
