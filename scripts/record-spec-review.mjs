// Record that the skill has been read against the spec as it stands right now:
// `npm run spec:review`.
//
// Run this AFTER re-reading whichever entries the guard reported - divergence
// sections, AST schema nodes, cheat-sheet rows - and after updating references/
// if they moved. Recording without reading is how the guard goes back to being
// decorative.
//
// One ledger is written per document the guard watches:
//
//   test/spec-review.json       docs/divergence-from-djot.md, per numbered section
//   test/schema-review.json     resources/ast-schema.json, per node definition
//   test/cheatsheet-review.json docs/cheatsheet.md, per row
//
// The second exists because the guard used to name only prose documents, so a
// rule stated in the schema could move without failing anything (#84). The third
// because naming a document is not the same as reading it: the cheat sheet was
// named and checked for token PRESENCE, so a row's meaning could be rewritten
// around a surviving token and nothing failed (#89).

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEDGERS, specRoot } from './review-ledgers.mjs'
import { compareSections, describeFindings } from './spec-sections.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const rev = specRev()

for (const ledger of LEDGERS) {
  record(ledger)
}

/**
 * @param {(typeof LEDGERS)[number]} ledger
 */
function record(ledger) {
  const reviewFile = join(root, 'test', ledger.reviewFile)
  const current = ledger.fingerprint(readFileSync(join(specRoot(root), ledger.source), 'utf8'))

  let previous = {}
  try {
    previous = JSON.parse(readFileSync(reviewFile, 'utf8'))
  } catch {
    // First run: no review file yet.
  }
  const recorded = previous[ledger.entries] ?? {}

  const findings = compareSections(recorded, current)

  // A note is a human's standing observation about an entry (for example, that
  // the trap deliberately documents the released engine rather than the spec).
  // It survives a re-record, because re-recording is not what makes it untrue -
  // but if the entry it annotates has moved, say so instead of silently
  // carrying it.
  const entries = {}
  for (const [label, value] of Object.entries(current)) {
    const note = recorded[label]?.note
    entries[label] = note ? { ...value, note } : value
  }

  const out = {
    $comment: ledger.comment,
    source: `spec/${ledger.source}`,
    spec_rev: rev,
    [ledger.entries]: entries,
  }
  writeFileSync(reviewFile, `${JSON.stringify(out, null, 2)}\n`)

  if (findings.length === 0) {
    process.stdout.write(`${ledger.source}: review is unchanged\n`)
    return
  }

  process.stdout.write(`${ledger.source}: recorded ${findings.length} ${ledger.kind} change(s):\n`)
  process.stdout.write(`${describeFindings(findings, ledger.kind)}\n`)
  const annotated = findings.filter((f) => f.note)
  if (annotated.length > 0) {
    process.stdout.write(
      `\n${ledger.kind}(s) ${annotated.map((f) => f.section).join(', ')} carry a recorded note ` +
        'and their text just moved - re-check that the note is still true.\n',
    )
  }
}

function specRev() {
  try {
    return execFileSync('git', ['-C', join(root, 'spec'), 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim()
  } catch {
    return 'unknown'
  }
}
