// Record that the trap list has been read against the spec as it stands right
// now: `npm run spec:review`.
//
// Run this AFTER re-reading whichever divergence sections the guard reported,
// and after updating references/traps.md if they moved. Recording without
// reading is how the guard goes back to being decorative.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sectionFingerprints, compareSections, describeFindings } from './spec-sections.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const specDoc = join(root, 'spec', 'docs', 'divergence-from-djot.md')
const reviewFile = join(root, 'test', 'spec-review.json')

const current = sectionFingerprints(readFileSync(specDoc, 'utf8'))

let previous = { sections: {} }
try {
  previous = JSON.parse(readFileSync(reviewFile, 'utf8'))
} catch {
  // First run: no review file yet.
}

const findings = compareSections(previous.sections ?? {}, current)

// A note is a human's standing observation about a section (for example, that
// the trap deliberately documents the released engine rather than the spec). It
// survives a re-record, because re-recording is not what makes it untrue - but
// if the section it annotates has moved, say so instead of silently carrying it.
const sections = {}
for (const [label, value] of Object.entries(current)) {
  const note = previous.sections?.[label]?.note
  sections[label] = note ? { ...value, note } : value
}

const out = {
  $comment:
    'Which spec divergence sections the trap list in references/traps.md was last read ' +
    'against. Regenerate with `npm run spec:review` AFTER re-reading the sections the ' +
    'drift guard names - see README, "Not drifting".',
  source: 'spec/docs/divergence-from-djot.md',
  spec_rev: specRev(),
  sections,
}

writeFileSync(reviewFile, `${JSON.stringify(out, null, 2)}\n`)

if (findings.length === 0) {
  process.stdout.write('spec review is unchanged\n')
} else {
  process.stdout.write(`recorded ${findings.length} section change(s):\n`)
  process.stdout.write(`${describeFindings(findings)}\n`)
  const annotated = findings.filter((f) => f.note)
  if (annotated.length > 0) {
    process.stdout.write(
      `\nSection(s) ${annotated.map((f) => f.section).join(', ')} carry a recorded note ` +
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
