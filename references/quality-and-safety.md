# Quality and safety checklist

- Use descriptive image alt text; use empty alt text only for decorative images.
- Keep heading levels ordered and give explicitly referenced sections stable ids.
- Prefer meaningful link text over raw URLs or “click here.”
- Give data tables header cells and add captions when context is not obvious.
- Do not place secrets, private notes, or security-sensitive material in comments:
  parser and renderer versions differ in how unclosed or fenced comments behave.
- A CriticMarkup editorial comment (`{#…#}`) is not a hidden comment. Plain and
  ANSI write its text into the surrounding output and report
  `editorial-comment-flattened`; HTML, Markdown and canonical Carve keep it.
  A note meant to stay out of every target is a `%%` comment, not an editorial one.
- Bare HTML is escaped as text, but explicit `` ```=html `` blocks and
  `` `…`{=html} `` inline raw emit executable output in an HTML host by default.
  Use them only when requested and when the host sanitization policy is known.
  For untrusted input use `allowRawHtml: false` (carve-js),
  `Options::with_raw_html(false)` (carve-rs), or `SafeMode` (carve-php).
  Escaping keeps the content visible rather than discarding it: a suppressed
  `` ```=html `` block renders as a fenced code block whose language is the raw
  format, and that escape is not a render loss (`CARVE-P10-013`). A policy that
  omits the block instead reports `raw-format-dropped`.
- Validate remote media/embed schemes and domains against the host policy.
- Canonical Carve source is not a sanitized artifact. `carve fmt` and the `carve`
  render target preserve authored destinations, denied schemes included, because
  they owe a round trip of the parsed document; the HTML, Markdown and ANSI
  targets are the ones that blank a denied destination. A tool that reads
  formatted source or an exported AST and wires a destination into a URL sink
  applies the denylist itself.
- Treat Mermaid, chart, math, template, Liquid, and Nunjucks processing as code or
  template execution controlled by the host, not as harmless core markup.
- Treat file inclusion as host I/O, not syntax sugar. The parser must stay pure;
  enable a resolver explicitly, fix one absolute containment root for the
  expansion, canonicalize paths and symlinks before checking containment, deny
  remote schemes by default, and keep cycle/depth/byte/resolver-call limits
  finite. Included source receives the same sanitization as the parent. For
  untrusted input, leave includes disabled (`--no-includes`; `--safe` does this in current CLIs).
  Keep inclusion disabled for server-side user content by default. The spec
  requires an administrator-only opt-in and explicit root to enable it;
  front-end rendering must not inherit that opt-in.
  A containment denial must not disclose whether an outside-root path exists.
- Ensure a document remains understandable when a Tier-3 renderer is unavailable.
- Preview issue and PR bodies containing nested fences before submission.
