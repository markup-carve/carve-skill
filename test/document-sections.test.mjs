import test from 'node:test'
import assert from 'node:assert/strict'
import { documentSectionFingerprints } from '../scripts/document-sections.mjs'

test('fingerprints ordinary H2/H3 sections but not fenced headings', () => {
  const sections = documentSectionFingerprints(`# Document

Preamble.

## Parent

Lead.

\`\`\`carve
## Example heading
\`\`\`

### Child

Rule.
`)
  assert.deepEqual(Object.keys(sections), ['Preamble', 'Parent', 'Parent / Child'])
  assert.notEqual(sections.Parent.sha256, sections['Parent / Child'].sha256)
})

test('normalizes layout whitespace but fingerprints changed meaning', () => {
  const plain = documentSectionFingerprints('## Rule\n\nOne rule.\n')
  const layout = documentSectionFingerprints('## Rule  \n\n\nOne rule.  \n')
  const changed = documentSectionFingerprints('## Rule\n\nThe opposite rule.\n')
  assert.equal(plain.Rule.sha256, layout.Rule.sha256)
  assert.notEqual(plain.Rule.sha256, changed.Rule.sha256)
})

test('keeps repeated semantic paths without overwriting either section', () => {
  const sections = documentSectionFingerprints('## Rule\nOne.\n## Rule\nTwo.\n')
  assert.deepEqual(Object.keys(sections), ['Preamble', 'Rule', 'Rule #2'])
  assert.notEqual(sections.Rule.sha256, sections['Rule #2'].sha256)
})

test('a fence-like line with info does not close an open fence', () => {
  const sections = documentSectionFingerprints('## Rule\n````md\n```js\n## sample\n```\n````\n')
  assert.deepEqual(Object.keys(sections), ['Preamble', 'Rule'])
})

test('keeps preamble, hierarchy and heading level in the fingerprints', () => {
  const h3 = documentSectionFingerprints('lede\n## Parent\n### Child\nRule.\n')
  const h2 = documentSectionFingerprints('changed lede\n## Parent\n## Child\nRule.\n')
  assert.notEqual(h3.Preamble.sha256, h2.Preamble.sha256)
  assert.ok(h3['Parent / Child'])
  assert.ok(h2.Child)
  assert.notEqual(h3['Parent / Child'].sha256, h2.Child.sha256)
})

test('section numbering is not identity and tilde fences hide sample headings', () => {
  const first = documentSectionFingerprints('## 5. Parent\n~~~md\n### Sample\n~~~\n### 5.1 Child\nRule.\n')
  const later = documentSectionFingerprints('## 6. Parent\n~~~md\n### Sample\n~~~\n### 6.1 Child\nRule.\n')
  assert.deepEqual(Object.keys(first), ['Preamble', 'Parent', 'Parent / Child'])
  assert.deepEqual(
    Object.values(first).map((entry) => entry.sha256),
    Object.values(later).map((entry) => entry.sha256),
  )
})

test('does not erase a leading number that is part of the heading text', () => {
  const sections = documentSectionFingerprints('## 3 shorthand forms\nRule.\n## 4 shorthand forms\nOther.\n')
  assert.deepEqual(Object.keys(sections), [
    'Preamble', '3 shorthand forms', '4 shorthand forms',
  ])
})

test('normalizes CRLF and keeps later headings inside an unclosed fence as content', () => {
  const lf = documentSectionFingerprints('## Rule\n~~~md\n### Sample\n')
  const crlf = documentSectionFingerprints('## Rule\r\n~~~md\r\n### Sample\r\n')
  assert.deepEqual(crlf, lf)
  assert.deepEqual(Object.keys(lf), ['Preamble', 'Rule'])
})

test('a four-space fence run is content, not a closing fence', () => {
  const sections = documentSectionFingerprints('## Rule\n```md\n    ```\n### Sample\n```\n## After\n')
  assert.deepEqual(Object.keys(sections), ['Preamble', 'Rule', 'After'])
})
