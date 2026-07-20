---
id: contributing
title: Contributing
sidebar_position: 5
---

# Contributing

famtree is an [NX](https://nx.dev) monorepo using **TypeScript** and **Bun**.

## Layout

```
apps/
  cli/          @famtree/cli — the famtree binary
  docs/         @famtree/docs — this documentation site (Docusaurus)
libs/
  schema/       @famtree/schema — JSON Schema + types
  core/         @famtree/core — graph + layout engine
  renderer/     @famtree/renderer — SVG renderer
  validate/     @famtree/validate — optional Ajv validation
examples/       sample documents + rendered output
```

## Setup

```bash
git clone https://github.com/felipeplets/famtree.git
cd famtree
bun install
```

## Common tasks

```bash
# Build every package
bun run build          # nx run-many -t build

# Typecheck / test everything
bun run typecheck
bun run test

# Render the example genogram
bun run example
```

NX caches task results and can build only what an affected change touches
(`nx affected -t build`). Explore the project graph with `bun run graph`.

## Working on the docs site

This site lives in `apps/docs` and is built with Docusaurus.

```bash
# Regenerate the schema & CLI reference pages, then start the dev server
nx start docs

# Production build (also regenerates reference pages first)
nx build docs
```

The **schema** and **CLI** reference pages are generated from
`libs/schema/famtree.schema.json` and the CLI's own help text, so they never drift
from the code. Do not edit `docs/reference/schema.md` or `docs/reference/cli.md` by
hand — change the source and re-run `nx run docs:gen`.

## Conventions

- **No semicolons**; formatted with Prettier (`printWidth: 120`).
- **Exports at the bottom** of each file.
- Dependency versions are **pinned exactly** (no `^`, `~`, or `latest`).

## Pull requests

Open a PR against `main`. Please run `bun run typecheck`, `bun run test`, and
`bun run build` before submitting.
