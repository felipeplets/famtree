# famtree

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

An [NX](https://nx.dev) monorepo for **genograms** — family diagrams capturing
individuals, their biological/legal relationships, and their emotional bonds — built
around a [JSON Schema](./libs/schema/famtree.schema.json), a fast dependency-free **SVG
renderer**, and a **CLI**.

Works on **Node ≥ 18** and **Bun**.

![Example genogram](./examples/genogram.png)

## Packages

Everything is published under the `@famtree/*` scope. Today the only publicly consumed
package is **`@famtree/cli`**; the rest are the libraries it composes.

| Package | Path | Responsibility |
|---------|------|----------------|
| [`@famtree/schema`](./libs/schema) | `libs/schema` | JSON Schema + TypeScript types (data contract, zero deps) |
| [`@famtree/core`](./libs/core) | `libs/core` | Domain graph + layout engine (doc → positioned graph) |
| [`@famtree/renderer`](./libs/renderer) | `libs/renderer` | SVG renderer + `renderGenogram()` |
| [`@famtree/validate`](./libs/validate) | `libs/validate` | Optional AJV validation against the schema |
| [`@famtree/cli`](./apps/cli) | `apps/cli` | `famtree` CLI (the public entry point) |

Dependency graph (acyclic):

```
schema ─┬─> core ─────> renderer ─┬─> @famtree/cli
        └─> validate ─────────────┘
```

## Install

```bash
npm install -g @famtree/cli
# or run without installing
npx @famtree/cli family.json -o family.svg
```

## CLI

```
famtree [input.json] [options]

Arguments:
  input.json            Path to a genogram document. Reads stdin if omitted or "-".

Options:
  -o, --output <file>   Write SVG to <file>. Writes stdout if omitted.
  -t, --title <title>   Override the document title.
      --validate        Validate the document against the schema before rendering.
  -h, --help            Show help.
  -v, --version         Show the version.
```

Examples:

```bash
famtree family.json -o family.svg          # file in, file out
cat family.json | famtree > family.svg     # stdin in, stdout out
famtree family.json --validate -o out.svg  # validate, then render
```

> `--validate` uses [`ajv`](https://ajv.js.org). It's an optional peer dependency —
> install it (`npm i ajv`) only if you use the flag.

## Library

```ts
import { renderGenogram } from "@famtree/renderer"
import type { Genogram } from "@famtree/schema"

const doc: Genogram = {
  version: "1.0.0",
  people: [
    { id: "a", sex: "male", name: "Alex" },
    { id: "b", sex: "female", name: "Bea" },
    { id: "c", sex: "female", name: "Cara", isProband: true },
  ],
  relationships: [
    { id: "u", type: "union", partnerIds: ["a", "b"], unionType: "married" },
    { id: "pc", type: "parent-child", childId: "c", unionId: "u" },
  ],
}

const { svg, stats } = renderGenogram(doc)
console.log(stats) // { people: 3, unions: 1, emotions: 0, width, height }
```

Advanced building blocks: `GenogramRenderer`, `Svg`, `esc` (`@famtree/renderer`);
`GenogramGraph`, `GenerationalLayout` (a swappable `LayoutEngine`), `Positions`
(`@famtree/core`); the schema object and all types (`@famtree/schema`).

## The schema

`libs/schema/famtree.schema.json` (JSON Schema Draft 2020-12) describes a document with
three top-level parts:

- **`people`** — individuals with `sex` (drives node shape), vital status,
  proband/pregnancy flags, twins, birth order, medical/mental-health/substance-use
  `conditions`, and optional style overrides.
- **`relationships`** — a tagged union of:
  - `union` — partnerships (married/cohabiting/…) with a status (divorced,
    separated, widowed, …).
  - `parent-child` — links a child to parents or a union, with biological type
    (adopted/foster/step/…) and pregnancy outcome.
  - `emotional` — bonds (close, fused, conflict, cutoff, hostile, …) with optional
    direction.
- **`layout`** — optional rendering hints, including explicit coordinate overrides.

## Rendering conventions

| Element | Convention |
|---------|------------|
| Male / female / unknown | Square / circle / diamond |
| Deceased | X through the shape |
| Proband | Double outline + arrow |
| Divorce / separation | `//` / `/` across the union line |
| Adoption & non-biological | Dashed parent link |
| Pregnancy loss | Small triangle (miscarriage/abortion) or diamond (stillbirth) |
| Emotional bonds | Colored parallel lines (closeness) or zigzag (conflict) |

## Development

This is an NX package-based monorepo using Bun workspaces.

```bash
bun install              # install + link workspaces
bun run typecheck        # nx run-many -t typecheck
bun run test             # nx run-many -t test
bun run build            # nx run-many -t build (respects dependency order)
bun run graph            # open the NX project graph
bun run example          # render examples/example.genogram.json

# per-project
npx nx build @famtree/renderer
npx nx test @famtree/renderer
```

During development the `@famtree/*` imports resolve straight to source via
`tsconfig.base.json` path aliases, so no build step is needed to run or test.

> **Build note:** the toolchain uses the native **TypeScript 7** compiler. Since
> TS 7.0 ships the fast `tsc` but no programmatic API yet, `tsup` handles JS
> bundling (ESM + CJS) while `tsc --emitDeclarationOnly` (via each package's
> `tsconfig.build.json`) generates the `.d.ts` files.

## License

[MIT](./LICENSE) © Felipe Plets
