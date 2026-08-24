// One spelling of "what is a divergence section, and has it changed", shared by
// the offline drift guard (against the pinned spec) and the scheduled workflow
// (against carve main). Two copies of this would drift from each other, which is
// the same class of defect the review file exists to close.

import { createHash } from 'node:crypto'

// A numbered divergence heading: "## 13. A colon fence closes…", allowing the
// "1b" / "1c" sub-numbering the spec uses. The unnumbered tail sections
// ("What Carve adds on top", "Porting Djot to Carve") are not divergences and
// carry no trap, so they are deliberately out of scope.
const HEADING = /^## (\d+[a-z]?)\. (.+)$/

/**
 * Fingerprint every numbered divergence section of `docs/divergence-from-djot.md`.
 *
 * The body is normalized (CRLF, trailing spaces, blank-line runs) so a
 * whitespace-only edit in the spec does not demand a re-review, and hashed, so
 * the review file records WHAT was reviewed without carrying a second copy of
 * the spec text that would itself rot.
 *
 * @param {string} text the divergence document
 * @returns {Record<string, {title: string, sha256: string}>} keyed by section label
 */
export function sectionFingerprints(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const sections = {}
  let label = null
  let title = null
  let body = []

  const flush = () => {
    if (label === null) return
    sections[label] = { title, sha256: fingerprint(title, body) }
  }

  for (const line of lines) {
    const m = HEADING.exec(line)
    if (m) {
      flush()
      label = m[1]
      title = m[2].trim()
      body = []
      continue
    }
    // Any other "## " heading ends the current numbered section.
    if (line.startsWith('## ')) {
      flush()
      label = null
      title = null
      body = []
      continue
    }
    if (label !== null) body.push(line)
  }
  flush()
  return sections
}

function fingerprint(title, bodyLines) {
  const body = bodyLines
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return createHash('sha256').update(`${title}\n\n${body}\n`).digest('hex')
}

/**
 * Compare recorded fingerprints against the ones a spec document produces now.
 *
 * @param {Record<string, {title: string, sha256: string, note?: string}>} recorded
 * @param {Record<string, {title: string, sha256: string}>} current
 * @returns {Array<{section: string, status: 'changed'|'added'|'removed', title: string, note?: string}>}
 *   sorted, empty when the review is still current
 */
export function compareSections(recorded, current) {
  const findings = []
  for (const [section, now] of Object.entries(current)) {
    const was = recorded[section]
    if (!was) {
      findings.push({ section, status: 'added', title: now.title })
    } else if (was.sha256 !== now.sha256) {
      findings.push({
        section,
        status: 'changed',
        title: now.title,
        ...(was.note ? { note: was.note } : {}),
      })
    }
  }
  for (const [section, was] of Object.entries(recorded)) {
    if (!current[section]) {
      findings.push({ section, status: 'removed', title: was.title })
    }
  }
  return findings.sort((a, b) => collate(a.section, b.section))
}

// Numbered labels sort numerically ("2" before "13"), everything else sorts as
// text. compareSections is shared with the AST schema ledger, whose labels are
// node NAMES; parseInt of one is NaN, and a comparator that returns NaN leaves
// the order to the engine rather than sorting at all.
function collate(a, b) {
  const na = parseInt(a, 10)
  const nb = parseInt(b, 10)
  const numeric = Number.isNaN(na) === false && Number.isNaN(nb) === false
  if (!numeric) return a.localeCompare(b)
  return na === nb ? a.localeCompare(b) : na - nb
}

/**
 * One human-readable line per finding, for a test message or a CI log.
 *
 * @param {ReturnType<typeof compareSections>} findings
 * @param {string} [kind] what the labels name - "section" for the divergence
 *   document, "node" for the AST schema
 * @returns {string}
 */
export function describeFindings(findings, kind = 'section') {
  return findings
    .map((f) => {
      const head = `  ${kind} ${f.section} ${f.status}: ${f.title}`
      return f.note ? `${head}\n    recorded note: ${f.note}` : head
    })
    .join('\n')
}
