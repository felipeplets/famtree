# @famtree/core

[![npm](https://img.shields.io/npm/v/@famtree/core.svg)](https://www.npmjs.com/package/@famtree/core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/felipeplets/famtree/blob/main/LICENSE)

The runtime-agnostic **domain graph and layout engine** for
[famtree](https://github.com/felipeplets/famtree) genograms. It turns a document
compliant with [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) into a
queryable family graph and computes 2D positions for each person — with **no SVG or DOM
knowledge**.

> This is an internal building block. Most users want
> [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) or
> [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer). Reach for
> `@famtree/core` when you're building a **custom renderer** or your own layout on top of
> the genogram model.

## Install

```bash
npm install @famtree/core
```

## Usage

```ts
import { GenogramGraph, GenerationalLayout } from "@famtree/core"
import type { Genogram } from "@famtree/schema"

const doc: Genogram = /* ... */ ({} as Genogram)

// 1. Build the domain graph (resolves generations, parents, unions, siblings).
const graph = new GenogramGraph(doc)

// 2. Compute positions with the default generational layout.
const positions = new GenerationalLayout().layout(graph)

const { width, height } = positions.bounds()
for (const person of graph.roster) {
  const x = positions.cx(person.id)
  const y = positions.cy(person.id)
  // feed (x, y) into your own renderer
}
```

## API

### `GenogramGraph`

Wraps a `Genogram` document and answers structural queries:

- `roster` — all people.
- `parentsOf(id)`, `parentLinkOf(id)` — a person's parents / parent-child link.
- `unionHeadedBy(id)`, `childrenOfUnion(unionId)`, `singleChildrenOf(id)`.
- `sortByBirth(ids)` — order sibling ids by birth order.
- `generationOf(id)` — computed generation index.

### `GenerationalLayout` (implements `LayoutEngine`)

`layout(graph): Positions` — assigns coordinates by generation, centering parents over
their children and spacing siblings.

### `Positions`

- `cx(id)` / `cy(id)` — center x / y for a person.
- `bounds()` — `{ width, height }` of the laid-out diagram.

### Layout constants

Geometry defaults are exported for reuse/inspection: `NODE`, `R`, `GEN_SPACING`,
`SIB_STEP`, `SPOUSE_HALF`, `MARGIN`, `LABEL_WRAP`, `LABEL_LINE_H`.

## Related packages

| Package | Description |
|---------|-------------|
| [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) | `famtree` command-line renderer |
| [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) | JSON Schema + TypeScript types |
| [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer) | SVG renderer |
| [`@famtree/validate`](https://www.npmjs.com/package/@famtree/validate) | Optional Ajv-backed schema validation |

## License

MIT © Felipe Plets
