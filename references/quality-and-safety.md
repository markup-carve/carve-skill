# Quality and safety in Carve 0.2

Provide useful headings, link text, image alt text, and table headers. Keep source order meaningful without CSS. Treat a lint finding as a prompt to inspect the rendered result, not as automatic proof of a defect or of safety.

The host chooses URL policy and raw HTML behavior. Raw HTML is escaped by default. Do not enable raw HTML for untrusted source without a host policy and output sanitization. An extension renderer may return opaque HTML, so inspect the extension's trust boundary. See [HTML options](../spec/spec/0.2/html.md#options) and [extensions](../spec/spec/0.2/extensions.md).

Includes can read outside the current file only through a configured resolver and allowed root. Set the root deliberately; inspect failed resolution and dependencies. Do not treat a literal include directive as expanded content. See [includes](../spec/spec/0.2/includes.md).

For imports, upgrades, tree migration, or writer output, read the diagnostic and loss record. A successful parse can still change HTML. Validate the exact target with the [0.2 CLI](validation.md).
