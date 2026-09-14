# Carve workflows

## MCP routing

Use Carve MCP as the execution layer when the host exposes it:

| Need | MCP capability |
| --- | --- |
| Confirm unfamiliar syntax | Read `carve://guide`, then the narrow `carve://rules/{ruleId}` resource |
| Validate touched source | `carve_lint`; read only the returned `carve://lint-rules/{ruleName}` resources |
| Repair automatic diagnostics | `carve_diagnose_and_fix`; choose explicit `automatic` fix IDs and retain its undo patch |
| Change structure | `carve_parse`, `carve_select_ast_nodes`, then `carve_plan_ast_edit` for a reversible source patch |
| Migrate Markdown, HTML, or Djot | `carve_migrate`, review fidelity diagnostics, then lint the result |
| Compare publishing outputs | `carve_check_targets`; list every target and inspect unsupported features and losses |
| Check workspace authorization | `carve_workspace_info`; filesystem tools need a configured root and writes need `--allow-write` |
| Review a documentation root | `carve_review_workspace`; lint files and check local links/anchors before forming a fix plan |
| Review document references | `carve_reference_graph`; inspect broken edges and orphaned definitions before cross-file edits |
| Preview canonical formatting | `carve_prepare_edit`, or `carve_prepare_workspace_edits` for several files |
| Edit an authorized file | `carve_read_file`, `carve_plan_ast_edit`, `carve_apply_reversible_ast_patch`, then dry-run and confirm `carve_write_file` |

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

### Safe diagnostic repairs

Run `carve_diagnose_and_fix` to separate automatic repairs from findings that
need writer judgment. Preview first, pass only explicitly chosen `automatic` IDs,
and retain the returned undo patch. Never turn an ambiguous recommendation into
an automatic rewrite.

### Atomic structural edits

Prefer `carve_plan_ast_edit` over constructing patches by hand. Select headings
by ID, footnotes by label, or nodes by type; use a returned `ast-path` only to
disambiguate the current source. Put linked selector-and-intent pairs in `then`:
all selectors resolve against the original document and the plan succeeds or
fails as one unit. This is appropriate for transferring a heading ID, removing
a footnote reference with its definition, or changing several siblings whose
indices would otherwise move. Review the consolidated source patch and notices.

### Authorized workspace changes

Workspace tools exist only when the MCP server has an authorized root. Check
`carve_workspace_info` first; writes additionally require `--allow-write`.
Use this chain for a semantic change: `carve_read_file` → inspect/select →
`carve_plan_ast_edit` → `carve_apply_reversible_ast_patch` → a dry-run
`carve_write_file` → confirmed write → re-lint. Preserve the read hash and use
it as `expectedSha256` when overwriting. Omit that field when creating a file.
Re-read and re-plan after a stale-hash refusal.

A semantic plan preserves bytes outside its returned source-edit span but may
canonicalize unrelated formatting inside that span. Inspect the complete patch
or diff before writing. When exact authored spelling matters, make a narrow
manual edit or use byte-ranged automatic diagnostic fixes instead.

`carve_prepare_edit` and `carve_prepare_workspace_edits` specifically preview
canonical formatting; use the batch form to review several formatting-only
proposals together. A lossy item requires writer review and deliberately has no
applicable patch.

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

## Publishing to several targets

Use `carve_check_targets` when more than one output or host matters. Distinguish
valid source from a construct that degrades, requires an extension, or is
unsupported in a particular target. Render only the chosen targets after the
comparison and report material losses to the writer. Supply every intended
target explicitly; plain text and ANSI are not part of the default set.

## Workspace references

When a root is authorized, start with `carve_review_workspace` for bounded lint
and local link/anchor checks; use its automatic versus writer-review fix plan.
Use `carve_reference_graph` before changing shared heading IDs, document links,
images, footnotes, or abbreviations. Resolve broken edges and review orphaned
definitions, then preview affected files together. A clean lint result does not
prove that references between documents still resolve.

The MCP's optional prompts are convenient entry points, not substitutes for
these checks. Follow their tool results and load only the narrow resources the
result identifies.
