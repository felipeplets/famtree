// Generates docs/reference/cli.md from the CLI's own help text (apps/cli/src/usage.ts).
// Run from apps/docs (via `nx run docs:gen`). Do not edit the output by hand.

import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { HELP } from "../../cli/src/usage.ts"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(HERE, "../docs/reference/cli.md")

const out = `---
id: cli
title: CLI reference
sidebar_position: 2
---

{/* GENERATED FILE — do not edit by hand. Source: apps/cli/src/usage.ts.
    Regenerate with: nx run docs:gen */}

# CLI reference

> This page is generated from the \`famtree\` CLI's own \`--help\` output, so it never
> drifts from the tool. Run \`famtree --help\` to see the same text locally.

\`\`\`text
${HELP.trim()}
\`\`\`

## Exit codes

| Code | Meaning                                            |
|-----:|----------------------------------------------------|
| \`0\`  | Success (or \`--help\` / \`--version\`)                |
| \`1\`  | Failed to read/parse input, or validation failed   |
| \`2\`  | Invalid command-line arguments                     |

See **[Rendering & output](../guides/rendering.md)** for usage examples.
`

mkdirSync(dirname(OUT_PATH), { recursive: true })
writeFileSync(OUT_PATH, out)
console.log(`Wrote ${OUT_PATH}`)
