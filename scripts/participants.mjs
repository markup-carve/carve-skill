/*
 * A runner must know how many things it compared, and say so when that number
 * is not what it should be.
 *
 * markup-carve/carve#755 collects the recurring shape: a check that reports
 * success without having verified anything. This repository is already in that
 * catalog once - markup-carve/carve-skill#4, the drift guard reading the pinned
 * spec, whose real cause turned out to be that it compared heading NUMBERS - and
 * the sweep that followed found the same family still present in
 * test/drift.test.mjs.
 *
 * The wording is carve's scripts/spec/participants.mjs, deliberately unaltered:
 * the two repositories should not disagree about what a short run reads like.
 */

/**
 * @param {{label: string, actual: number, atLeast: number, of?: string, hint?: string}} spec
 * @returns {string | null} a finding, or null when the count is sufficient
 */
export function shortfall({ label, actual, atLeast, of, hint }) {
  if (!Number.isInteger(actual) || actual < 0) {
    return `${label}: participant count is ${actual}, which is not a count at all`
  }
  if (actual >= atLeast) return null
  const subject = of ? ` ${of}` : ''
  const because = hint ? ` ${hint}` : ''

  return (
    `${label}: compared ${actual}${subject} but expected at least ${atLeast}. ` +
    `A run over fewer than it should have is not a pass - it is a smaller ` +
    `question answered.${because}`
  )
}
