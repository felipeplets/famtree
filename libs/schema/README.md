# @famtree/schema

[![npm](https://img.shields.io/npm/v/@famtree/schema.svg)](https://www.npmjs.com/package/@famtree/schema)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/felipeplets/famtree/blob/main/LICENSE)

The source-of-truth **data contract** for [famtree](https://github.com/felipeplets/famtree)
genogram documents: a [JSON Schema (Draft 2020-12)](https://json-schema.org/) plus the
matching **TypeScript types**. Zero runtime dependencies.

A *genogram* is a family diagram capturing individuals, their biological/legal
relationships (unions, parent-child), and their emotional relationships.

## Install

```bash
npm install @famtree/schema
```

## What's inside

- **TypeScript types** describing a genogram document.
- **`schema`** — the JSON Schema object (importable).
- **`@famtree/schema/famtree.schema.json`** — the raw schema file, for tooling that
  wants the JSON directly (editors, validators, codegen).

## Usage

### TypeScript types

```ts
import type { Genogram, Person, Relationship } from "@famtree/schema"

const doc: Genogram = {
  version: "1.0.0",
  people: [
    { id: "a", name: "Ada", sex: "female", birthDate: "1815-12-10" },
  ],
  relationships: [],
}
```

Exported types include:
`Genogram`, `Person`, `Sex`, `Condition`, `NodeStyle`, `Relationship`,
`UnionRelationship`, `ParentChildRelationship`, `EmotionalRelationship`,
`EmotionalBond`, and `Layout`.

### The schema object

```ts
import { schema } from "@famtree/schema"
// Pass to any JSON Schema validator (see @famtree/validate for a ready-made one).
```

### The raw JSON file

```ts
import schema from "@famtree/schema/famtree.schema.json" with { type: "json" }
```

Or reference it directly from the repo for editor tooling:
`https://github.com/felipeplets/famtree/blob/main/libs/schema/famtree.schema.json`

## Document shape (overview)

A document has a `version`, optional `metadata`, an array of `people`, an array of
`relationships`, and an optional `layout` hint block. Relationships are a discriminated
union on `type`:

- **`union`** — a partnership between two people (marriage, cohabitation, …) with an
  `unionType` and `status` (current/separated/divorced/…).
- **`parent-child`** — links a `childId` to parents or a parental `unionId`, with a
  `biological` kind (biological/adopted/foster/step/surrogate) and optional
  `pregnancyOutcome`.
- **`emotional`** — a `bond` between two people (close, distant, conflict, cutoff, …)
  with an optional `direction`.

People carry attributes such as `sex` (shape), `deceased`/`deathDate`, `isProband`,
twins (`twinGroupId`/`twinType`), `conditions`, and `style`.

See the [full schema](https://github.com/felipeplets/famtree/blob/main/libs/schema/famtree.schema.json)
for the authoritative, field-by-field definition.

## Related packages

| Package | Description |
|---------|-------------|
| [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) | `famtree` command-line renderer |
| [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer) | SVG renderer |
| [`@famtree/validate`](https://www.npmjs.com/package/@famtree/validate) | Optional Ajv-backed schema validation |
| [`@famtree/core`](https://www.npmjs.com/package/@famtree/core) | Domain graph + layout engine |

## License

MIT © Felipe Plets
