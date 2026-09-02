// THE REVISION EACH LEDGER WAS RECORDED AGAINST, CHECKED RATHER THAN RECORDED.
//
// Every ledger under test/ carries a `spec_rev`. Until markup-carve/carve-skill#101
// it had one write in scripts/record-spec-review.mjs and zero reads anywhere -
// a recorded claim no gate verified, which is the shape this repository keeps
// closing elsewhere. Measured on main at the time: six of the eight ledgers said
// `f59cc880` under a pin of `2775b6df`, because markup-carve/carve-skill#97
// recorded the review and then moved the pin again in a later commit of the same
// pull request. Nothing could report that, because nothing looked.
//
// WHAT IT CATCHES THAT THE FINGERPRINTS CANNOT. The fingerprint ledgers answer
// "did the watched text change"; they compare a recorded hash against whatever
// checkout is in hand and stay green whenever the two revisions happen to agree
// on every watched surface. They cannot answer "against which revision was this
// read", so a review recorded from a stale working copy, a half-applied bump or
// a worktree whose submodule was never updated is indistinguishable from a
// current one for as long as the surfaces agree.
//
// THREE VALUES, NOT TWO. The revision this repository PINS is the gitlink in its
// own tree; the revision it READ is the submodule's checked-out HEAD; the
// revision it RECORDED is the ledger stamp. Comparing the stamp against the
// checkout alone would miss the half-applied bump the ticket names, because a
// ledger recorded from a stale working copy names that stale revision and the
// two agree with each other while both disagree with the pin.
//
// ONLY AGAINST THE PIN. The scheduled workflow points the checker at a fresh
// clone of carve main, where the ledgers naming the pin is the NORMAL state and
// a mismatch is the very lag that job reports separately. So this comparison is
// made when the checkout being read is the pinned submodule, and not otherwise.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LEDGERS, specRoot } from './review-ledgers.mjs'

/**
 * The revision a spec checkout is at.
 *
 * @param {string} checkout a spec checkout directory
 * @returns {string | null} the commit, or null when git cannot answer
 */
export function revisionOf(checkout) {
  try {
    const rev = execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return /^[0-9a-f]{40}$/.test(rev) ? rev : null
  } catch {
    return null
  }
}

/**
 * The revision this repository pins, as opposed to the one it has checked out.
 *
 * @param {string} repoRoot this repository's root
 * @returns {string | null} the gitlink commit, or null when git cannot answer
 */
export function pinnedRevision(repoRoot) {
  try {
    const rev = execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD:spec'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return /^[0-9a-f]{40}$/.test(rev) ? rev : null
  } catch {
    return null
  }
}

/**
 * Whether a spec checkout has edits the recorded revision does not describe.
 *
 * @param {string} checkout a spec checkout directory
 * @returns {string | null} the porcelain status, or null when git cannot answer
 */
export function dirtyStateOf(checkout) {
  try {
    return execFileSync('git', ['-C', checkout, 'status', '--porcelain'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

/**
 * Every ledger records the revision of the pinned spec, and the same one.
 *
 * @param {string} repoRoot this repository's root
 * @returns {string[]} findings, empty when every ledger names the pinned revision
 */
export function revisionFindings(repoRoot) {
  const checkout = specRoot(repoRoot)
  const pinned = pinnedRevision(repoRoot)
  if (pinned === null) {
    return [
      'the spec gitlink cannot be read from git, so no ledger spec_rev can be checked ' +
        'against the revision this repository pins.',
    ]
  }

  const findings = []

  // The checkout is what the fingerprints were taken from, so a checkout behind
  // the gitlink means every ledger describes a document this repository does not
  // pin - even when the stamp and the checkout agree with each other.
  const readAt = revisionOf(checkout)
  if (readAt === null) {
    findings.push(
      `${checkout}: the spec checkout revision cannot be read from git - run ` +
        '`git submodule update --init`.',
    )
  } else if (readAt !== pinned) {
    findings.push(
      `${checkout}: checked out at ${readAt.slice(0, 8)}, but this repository pins ` +
        `${pinned.slice(0, 8)}. ` +
        'Run `git submodule update` - everything below was fingerprinted from the checkout.',
    )
  }

  for (const ledger of LEDGERS) {
    const file = join(repoRoot, 'test', ledger.reviewFile)
    let recorded
    try {
      recorded = JSON.parse(readFileSync(file, 'utf8')).spec_rev
    } catch (error) {
      findings.push(`test/${ledger.reviewFile}: ${error.message}`)
      continue
    }
    if (typeof recorded !== 'string' || recorded === '') {
      findings.push(
        `test/${ledger.reviewFile}: records no spec_rev, so it does not say which revision ` +
          'the skill was read against.',
      )
      continue
    }
    if (recorded !== pinned) {
      findings.push(
        `test/${ledger.reviewFile}: recorded against ${recorded.slice(0, 8)}, but this ` +
          `repository pins ${pinned.slice(0, 8)} - the fingerprints in it describe a document ` +
          'this repository does not pin.',
      )
    }
  }

  return findings
}

/**
 * The instruction that fixes every finding above.
 */
export const REREAD =
  'Re-read whatever `npm run spec:check` names at the current pin, then record the review\n' +
  'with `npm run spec:review` so every ledger says which revision it was read against.'
