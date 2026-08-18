# Quality and safety checklist

- Use descriptive image alt text; use empty alt text only for decorative images.
- Keep heading levels ordered and give explicitly referenced sections stable ids.
- Prefer meaningful link text over raw URLs or “click here.”
- Give data tables header cells and add captions when context is not obvious.
- Do not place secrets, private notes, or security-sensitive material in comments:
  parser and renderer versions differ in how unclosed or fenced comments behave.
- Treat raw HTML as executable output in an HTML host. Use it only when requested
  and when the host sanitization policy is known.
- Validate remote media/embed schemes and domains against the host policy.
- Treat Mermaid, chart, math, template, Liquid, and Nunjucks processing as code or
  template execution controlled by the host, not as harmless core markup.
- Ensure a document remains understandable when a Tier-3 renderer is unavailable.
- Preview issue and PR bodies containing nested fences before submission.
