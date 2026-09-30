# Spec review, 2026-09-30

Reviewed `b1a592379afc51f245c27bdb0c12cfe2273f5474` through
`de08416e99e2d6b0c3014977190cffebe7daca5c`, a commit on carve main, 78 commits
of lag. The drift guard named 1 AST node, 1 extension contract section, 3
validation sections, 6 added rules and 26 clause entries. The divergence,
cheatsheet, extension guide and security ledgers had no changed entries.

The engine moved from `@markup-carve/carve` 0.1.7 to 0.1.9 in the same pass,
because a dated status note is evidence only while its premise holds. Every
version-dated claim in `references/` was re-measured against 0.1.9 rather than
carried over.

## Reference changes

Six claims flipped and all six were corrections, not version-number edits.

- `fence-opener-fallback` SHIPPED. ```` ```js {.diff} ```` now reports it and
  still renders as one `<code>` span, so the validation guide says the finding
  names the degradation rather than preventing it.
- `footnotes-placement-in-container` shipped for footnotes ONLY. The
  bibliography and references siblings are still unreported, so the validation
  and extension guides now split the three rather than calling the gap total.
- A quoted title and an opener label survive on a PLACING marker
  (`CARVE-P9-072`), where 0.1.7 dropped both. The extension guide's advice to
  leave a placing marker untitled is now scoped to older engines.
- `definition-term-block-folded` shipped. The render is unchanged; the block
  guide records that lint names the fold from 0.1.9 on.
- Markdown export no longer writes `{#h}` after an explicitly identified
  heading and rewrites the link to the GFM slug, so the publishing workflow's
  example of a spec rule the engine lacked no longer holds.
- Mixing `.class` with `class=VALUE` now emits one merged HTML class attribute
  in source order instead of two `class` attributes.

The CLI symlink hazard also cleared: `./node_modules/.bin/carve lint` reports
and exits `1` on 0.1.9. The validation guide keeps the instruction to prove the
command can fail, which is what would catch the next regression, and scopes the
direct `dist/cli.js` workaround to older engines.

Unchanged and re-measured: `table-alignment-run-padding` for `|>text |`,
`lintCarve` returning nothing for `a **x** b` while the CLI reports
`markdown-strong-double-star`, `class=w-1/2`, the two admonition landmark
forms, an authored footnotes body rendering before the endnotes section, the
vertical cell alignment table, and both formatter spellings of an attached
block in a list item.

## Reviewed without new authoring instructions

- `code_block.content` is literal payload text (`CARVE-P12-064`), with the AST
  node description restated to match: empty content, a blank line and content
  with or without a final break are distinct, and HTML adds no payload newline.
  0.1.9 renders `<pre><code>a\n</code></pre>` and `<pre><code></code></pre>`.
  No reference page states a trailing-newline rule.
- `CARVE-P0-021` and `CARVE-P0-022` extend the band clause from list markers to
  every block opener and to an opaque marker-line quote. Both refine trap 11's
  area without changing the advice to write at the container's content column.
- `CARVE-P9-077` and `CARVE-P10-012` decide when a footnote body is empty and
  when a matching raw block keeps a placement slot. Measured on 0.1.9: an
  all-invisible note body opens its `<li>` directly on the backlink paragraph.
  No reference teaches either shape.
- `CARVE-P2-029` drops Markdown info-string text that is not a language;
  `markdownToCarve('```ruby startline=3')` keeps only `ruby` on 0.1.9.
- A link inside a SPAN label keeps its destination (`[[t](/v)]{.c}` renders a
  linked word inside the span), and a bracket run bounds forced and editorial
  pairing so `[{+a]+}` is text. No reference states the blanket no-nesting rule
  these narrow.
- Link and image titles cross a soft wrap and take the full ASCII punctuation
  escape set; a quoted attribute value takes the same set but not a newline.
  The attribute guide's advice on when to quote a value is unaffected.
- A trailing `%%` consumes the whole whitespace run before it and ends at the
  run's own closer. 0.1.9 renders `a  %% c` as `<p>a</p>` and
  `[a %% c](/u) t` as a link followed by ` t`.
- The extension contract's new 13.6 paragraph fixes Tabs and CodeGroup
  indentation, and the validation source's lint parity table now records
  per-engine coverage. Neither is restated in a reference page.
- `quote_block` joins the document grammar. 0.1.9 renders `>>>` as a paragraph,
  so it is spec-only and no reference teaches it.

## Release checks

`npm view @markup-carve/carve version` returned 0.1.9 and the lockfile now
matches. `references/capabilities.json` names 0.1.9 and flips
`fence_opener_fallback_lint`, `directive_title` and `footnotes_placement_lint`
to true; `npm test` re-runs each probe against the engine it names. The
progressive-disclosure profile table was re-measured after the prose edits.
