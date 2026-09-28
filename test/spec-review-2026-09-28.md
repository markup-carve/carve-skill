# Spec review, 2026-09-28

Reviewed `45784cbc` through `b1a592379afc51f245c27bdb0c12cfe2273f5474`,
a commit on carve main. The drift guard identified 10 AST entries, 7 extension
contract sections, 2 validation sections, 23 rule entries and 67 clause
entries, including additions, removals and renamed clauses. Divergence,
cheatsheet, extension guide and security ledgers had no changed entries.

## Reference changes

The block guide now explains definition-term folding and its missing 0.1.7
diagnostic. The attribute guide covers the class key-value spelling and pipes
in quoted cell attributes. Extension guidance records authored directive body
placement and nested TOC marker scope. Validation distinguishes the specified
lint inventory from release coverage. Publishing guidance warns about the
released Markdown heading-anchor behavior. Include guidance incorporates the
grammar's server-side opt-in and containment-disclosure requirements.

## Reviewed without new authoring instructions

- The AST adds `non_breaking_space`, requires directive `children`, rejects an
  empty admonition kind, and adds table head/foot attributes. No reference
  teaches the removed U+E000 sentinel or constructs those AST fields. The
  release still parses an escaped space into a U+E000-containing text node;
  the pin describes the newer contract, not that release's wire format.
- Container ownership clarifications cover comments, blanks, sibling markers,
  pending attributes, dedented fences and continuation markers. Existing
  advice to use the containing column and preview structure remains applicable.
  The new term paragraph records the author-facing exception.
- Formatter clauses clarify escaping across nodes, brackets, destination
  openers, verbatim whitespace and delimited-comment padding. Existing advice
  delegates canonicalization to the formatter and preserves authored source
  during local edits.
- Markdown clauses specify contextual escaping, autolink avoidance, cell
  breaks, table headers, adjacent-list markers, definition lists, list-tables,
  frontmatter and fragment links. The workflow now directs agents to preview
  those outputs without claiming that 0.1.7 implements the new contract.
- HTML class ordering, accessible region naming, table group attributes,
  block-cell flattening and conversion diagnostic fields refine renderer and
  interchange contracts. Existing target checks and loss-report review still
  apply; no reference restates the obsolete details.
- AST envelope wording, node roles, annotation projections and provenance
  coordinates affect structured consumers. The validation guide already
  assigns `pos.file` coordinates to that input, and teaches no conflicting
  envelope or annotation shape.

## Release checks

`npm view @markup-carve/carve version` returned 0.1.7, matching the lockfile.
Local probes of that package confirmed term folding without a lint finding,
`class=w-1/2`, a footnotes body preceding its section, the older
`table-alignment-run-padding` id, the Markdown heading suffix, and the escaped
space sentinel. The engine pin and capability values remain unchanged;
`npm test` rechecks the recorded feature probes.
