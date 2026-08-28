// Fingerprint the preamble and ordinary H2/H3 sections of a Markdown source.
// Numbering is presentation rather than identity: inserting a section must not
// make every later entry look removed and re-added. H3 labels include their H2
// parent, and repeated semantic paths get an explicit occurrence suffix.

import { createHash } from 'node:crypto'

const HEADING = /^(#{2,3})[ \t]+(.+)$/
const FENCE = /^[ \t]{0,3}(`{3,}|~{3,})/

/**
 * @param {string} text
 * @returns {Record<string, {title: string, sha256: string}>}
 */
export function documentSectionFingerprints(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const sections = Object.create(null)
  let level = 1
  let title = 'Preamble'
  let body = []
  let fence = null
  let parent = null

  const flush = () => {
    const semanticTitle = withoutNumber(title)
    const path = level === 3 && parent !== null
      ? `${withoutNumber(parent)} / ${semanticTitle}`
      : semanticTitle
    let label = path
    for (let occurrence = 2; Object.hasOwn(sections, label); occurrence += 1) {
      label = `${path} #${occurrence}`
    }
    sections[label] = { title, sha256: fingerprint(level, semanticTitle, body) }
  }

  for (const line of lines) {
    const fenced = FENCE.exec(line)
    if (fence !== null && closesFence(line, fence)) {
      fence = null
      body.push(line)
      continue
    }
    if (fence === null && fenced) {
      const marker = fenced[1][0]
      fence = { marker, width: fenced[1].length }
      body.push(line)
      continue
    }

    const heading = fence === null ? HEADING.exec(line) : null
    if (heading) {
      flush()
      level = heading[1].length
      title = heading[2].trim().replace(/[ \t]+#+[ \t]*$/, '')
      if (level === 2) parent = title
      body = []
      continue
    }
    body.push(line)
  }
  flush()
  return sections
}

function withoutNumber(title) {
  return title.replace(/^\d+[a-z]?(?:(?:\.\d+)+|\.)[ \t]+/, '')
}

function closesFence(line, fence) {
  const indent = line.length - line.trimStart().length
  const trimmed = line.trim()
  return indent <= 3 && trimmed.length >= fence.width &&
    trimmed.split('').every((character) => character === fence.marker)
}

function fingerprint(level, title, bodyLines) {
  const body = bodyLines
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return createHash('sha256').update(`${level}\n${title}\n\n${body}\n`).digest('hex')
}
