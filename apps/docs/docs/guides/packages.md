---
id: packages
title: Packages
sidebar_position: 4
---

# Packages

famtree is an NX monorepo published as focused `@famtree/*` packages. Install just
the [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) for command-line
use, or compose the libraries directly in your own tools.

| Package | Description |
|---------|-------------|
| [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) | The `famtree` command-line tool. |
| [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) | JSON Schema + TypeScript types for genogram documents. |
| [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer) | SVG renderer — `renderGenogram()`. |
| [`@famtree/core`](https://www.npmjs.com/package/@famtree/core) | Domain graph + generational layout engine. |
| [`@famtree/validate`](https://www.npmjs.com/package/@famtree/validate) | Optional Ajv-backed schema validation. |

## Dependency graph

```
schema ─┬─> core ─────> renderer ─┬─> @famtree/cli
        └─> validate ─────────────┘
```

## Rendering programmatically

Render a document to an SVG string with `@famtree/renderer`:

```ts
import { renderGenogram } from '@famtree/renderer'
import type { Genogram } from '@famtree/schema'

const doc: Genogram = {
  version: '1.0.0',
  people: [
    { id: 'dad', name: 'John', sex: 'male' },
    { id: 'mom', name: 'Jane', sex: 'female' },
    { id: 'kid', name: 'Alex', sex: 'male', isProband: true },
  ],
  relationships: [
    { id: 'u1', type: 'union', partnerIds: ['dad', 'mom'], unionType: 'married' },
    { id: 'pc1', type: 'parent-child', childId: 'kid', unionId: 'u1' },
  ],
}

const { svg, stats } = renderGenogram(doc)
// svg   -> the SVG markup string
// stats -> { people, unions, emotions, width, height }
console.log(svg)
```

## Validating programmatically

`@famtree/validate` wraps [Ajv](https://ajv.js.org/) (an optional peer dependency)
and throws with a readable message when a document is invalid:

```ts
import { validate } from '@famtree/validate'

await validate(doc) // resolves if valid, throws with details otherwise
```

## The core engine

`@famtree/core` exposes the domain graph and layout engine used by the renderer —
useful if you want to build an alternative renderer or inspect positions:

```ts
import { GenogramGraph, GenerationalLayout } from '@famtree/core'

const graph = new GenogramGraph(doc)
const positions = new GenerationalLayout().layout(graph)
```

## Types & schema

`@famtree/schema` is the single source of truth. It ships both the machine-readable
JSON Schema and matching TypeScript types:

```ts
import { schema } from '@famtree/schema'
import type { Genogram, Person, Relationship } from '@famtree/schema'
```

See the **[schema reference](../reference/schema.md)** for every field.
