# @famtree/validate

[![npm](https://img.shields.io/npm/v/@famtree/validate.svg)](https://www.npmjs.com/package/@famtree/validate)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/felipeplets/famtree/blob/main/LICENSE)

Validate [famtree](https://github.com/felipeplets/famtree) genogram documents against
[`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) using
[Ajv](https://ajv.js.org/) (JSON Schema Draft 2020-12).

To keep the footprint small, **`ajv` is an optional peer dependency** — it's loaded lazily
only when you actually validate.

## Install

```bash
npm install @famtree/validate ajv
```

If you install `@famtree/validate` without `ajv`, calling `validate()` throws a clear
error telling you to add `ajv`.

## Usage

```ts
import { validate } from "@famtree/validate"

try {
  await validate(doc) // doc: unknown
  // doc conforms to famtree.schema.json
} catch (err) {
  // Either ajv is missing, or the document is invalid.
  // Invalid-document errors list each failing path and message.
  console.error((err as Error).message)
}
```

### `validate(doc: unknown): Promise<void>`

- Resolves when `doc` matches the schema.
- Rejects with an `Error` whose message aggregates all schema violations
  (`allErrors: true`), each as `• <path> <message>`.
- Rejects with an install hint if the optional `ajv` dependency is not present.

It's async because `ajv` is imported on demand the first time you validate.

## Notes

- This package validates **structure** against the JSON Schema. Deeper semantic checks
  (dangling references, duplicate ids, proband uniqueness, …) are
  [tracked separately](https://github.com/felipeplets/famtree/issues/12).
- The [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) `--validate` flag uses
  this package under the hood.

## Related packages

| Package | Description |
|---------|-------------|
| [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) | `famtree` command-line renderer |
| [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) | JSON Schema + TypeScript types |
| [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer) | SVG renderer |
| [`@famtree/core`](https://www.npmjs.com/package/@famtree/core) | Domain graph + layout engine |

## License

MIT © Felipe Plets
