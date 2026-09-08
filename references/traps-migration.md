# Djot migration checklist

Use after reading the relevant topic guide for constructs present in the source.
Trap numbers 1–6 are in the foundation guide, 7–13a in block/container, and
14–21 in structure/reference.

1. `_italic_` → `/italic/`; check every `*…*` (Djot strong stays `*…*`).
2. `~sub~` → `{,sub,}`, `^sup^` → `{^sup^}`; a `~…~` used for strikethrough is now native.
3. `+` bullets → `-` or `*`.
4. `{% comment %}` needs no change - section 21a keeps the Djot spelling working and every released engine implements it (trap 6). Convert to `%%` only where the comment already occupies its own line.
5. A marker line directly under prose now starts a block — add a blank line or escape where you relied on Djot keeping it in the paragraph.
6. A wrapped heading (a plain or same-`#` line under `# Title`) no longer folds in — join it onto the heading line, or accept it as a paragraph.
7. Definition lists: `: term` (+ indented body) → `:: term` then `:  definition`.

The bundled `markdownToCarve` helper and `carve lint --from-djot` flag most of these automatically.
