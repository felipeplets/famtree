#!/usr/bin/env node
// famtree CLI — render a genogram JSON document to SVG.
//
// Usage:
//   famtree <input.json> [-o output.svg]   render a file
//   famtree < input.json > output.svg      read stdin, write stdout
//   cat input.json | famtree --validate    validate + render
//
// Runtime-agnostic: uses Node's fs/process APIs (also runs under Bun).
// This is the thin bootstrap entry; see run.ts, args.ts, io.ts, usage.ts.

import { run } from "./run"

run(process.argv.slice(2)).then((code) => process.exit(code))
