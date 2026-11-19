# Extensions in Carve 0.2

The 0.2 [extension contract](../spec/spec/0.2/extensions.md) defines registration, matching, tree transformation, resolution, rendering, and writing. An extension must preserve a valid core fallback. Do not treat a host's registered extension as available in another renderer. In carve-js the provisional standard extensions (for example `details`, `spoiler`, `wikilinks`, `smartQuotes`, and the fenced renderers) come from `@markup-carve/carve/extensions` and work only when the host registers them.

The standard tabs extension groups tab panels and has its own registration and output rules. Verify it in the target host. Named divs such as `::: note` and ordinary classes are core document structure, not a guarantee that a host has a specialized renderer. For math rendering, diagrams, embeds, and other host features, check the registered extension and its loss diagnostics before promising output.

An extension may return HTML the host cannot inspect. Trust and sanitization remain host responsibilities. Use the host's URL policy and raw HTML decision; do not infer either from the source alone. See [quality and safety](quality-and-safety.md).
