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
  const pinned = revisionOf(checkout)
  if (pinned === null) {
    return [
      `${checkout}: the pinned spec revision cannot be read from git, so no ledger's ` +
        'spec_rev can be verified - run `git submodule update --init`.',
    ]
  }

  const findings = []
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
        `test/${ledger.reviewFile}: recorded against ${recorded.slice(0, 8)}, but the spec ` +
          `submodule pins ${pinned.slice(0, 8)} - the fingerprints in it describe a document ` +
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
