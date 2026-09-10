# Authoring workflows

## MCP routing

Use Carve MCP as the execution layer when the host exposes it:

| Need | MCP capability |
| --- | --- |
| Confirm unfamiliar syntax | Read `carve://guide`, then the narrow `carve://rules/{ruleId}` resource |
| Validate touched source | `carve_lint`; read only the returned `carve://lint-rules/{ruleName}` resources |
| Change structure | `carve_parse`, select a semantic node, then preview a reversible AST patch |
| Migrate Markdown, HTML, or Djot | `carve_migrate`, review fidelity diagnostics, then lint the result |
| Prepare for a publishing host | Render the target and inspect losses; enable the relevant lint platform |
| Edit authorized files | Read first, preview the source patch, then write only with its stale-content hash |

Do not load every resource pre-emptively. MCP results determine the next narrow
resource or tool. If MCP is absent, use the matching-version project CLI paths
described in [validation](validation.md).

## New document

1. Discover the implementation, version, renderer, and enabled extensions.
2. Start with core syntax and a logical heading hierarchy.
3. Add host-dependent constructs only when the target declares support.
4. Lint every new file and preview structure-sensitive output.

## Local edit

Read the complete containing block before editing. Preserve authored spellings,
attribute placement, indentation, newline style, and fence widths. Change only
the requested region. Do not run a whole-document formatter unless asked.

## Markdown or Djot migration

Use the project's converter when available, then lint with `--from-djot`. Review
emphasis, underline, strike, sup/sub, lists, heading attributes, definitions,
comments, raw blocks, and cross-references manually. Finish with ordinary lint;
`--from-djot` is a migration audit, not the steady-state authoring mode.

## Issue, PR, or chat body

The enclosing body is Markdown even when the sample is Carve. Find the longest
bare backtick fence line in the sample and make the outer Markdown fence longer.
Do the same recursively for `:::` containers inside the Carve sample. Preview
the submitted body and verify that prose after the sample did not enter it.

## Complex containers and tables

Determine each container's effective content column before inserting a child
block. Keep list continuations (`+`) on their own line. For tables, verify header,
rowspan/colspan, continuation cells, and caption output rather than relying on a
clean lint alone.

## Extensions

Check the host feature table and renderer. Include a readable fallback for
Tier-3 content. Never infer extension support solely because the syntax parses.
