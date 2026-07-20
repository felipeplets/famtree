# @famtree/renderer

[![npm](https://img.shields.io/npm/v/@famtree/renderer.svg)](https://www.npmjs.com/package/@famtree/renderer)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/felipeplets/famtree/blob/main/LICENSE)

The **SVG renderer** for [famtree](https://github.com/felipeplets/famtree) genograms. Give
it a document compliant with [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema)
and it returns standalone SVG markup plus summary statistics.

Zero runtime dependencies. Works in **Node**, **Bun**, and the browser.

![Example genogram](https://raw.githubusercontent.com/felipeplets/famtree/main/examples/genogram.png)

## Install

```bash
npm install @famtree/renderer
```

## Usage

```ts
import { renderGenogram } from "@famtree/renderer"
import type { Genogram } from "@famtree/schema"

const doc: Genogram = {
  version: "1.0.0",
  metadata: { title: "Minimal Family", focusPersonId: "kid" },
  people: [
    { id: "dad", name: "John", sex: "male", birthDate: "1970-04-12" },
    { id: "mom", name: "Jane", sex: "female", birthDate: "1972-09-30" },
    { id: "kid", name: "Alex", sex: "male", birthDate: "2001-01-05", isProband: true },
  ],
  relationships: [
    { id: "u1", type: "union", partnerIds: ["dad", "mom"], unionType: "married" },
    { id: "pc1", type: "parent-child", childId: "kid", unionId: "u1" },
  ],
}

const { svg, stats } = renderGenogram(doc)
// svg   -> "<svg ...>...</svg>"
// stats -> { people, unions, emotions, width, height }
```

## API

### `renderGenogram(doc: Genogram): RenderResult`

Convenience wrapper that renders a document in one call.

```ts
interface RenderStats {
  people: number
  unions: number
  emotions: number
  width: number
  height: number
}

interface RenderResult {
  svg: string
  stats: RenderStats
}
```

### `GenogramRenderer`

The renderer class behind `renderGenogram`. Instantiate it directly when you want to
reuse an instance:

```ts
import { GenogramRenderer } from "@famtree/renderer"

const renderer = new GenogramRenderer()
const { svg, stats } = renderer.render(doc)
```

`renderGenogram(doc)` is exactly `new GenogramRenderer().render(doc)`.

### `Svg`, `esc`

Low-level helpers are also exported: `Svg` (a small SVG string builder) and `esc`
(XML-escape a string), for advanced/custom rendering.

## What it draws

Standard genogram conventions: square/circle nodes by `sex`, deceased markers, the
proband arrow, union lines with separation/divorce marks, sibling/parent bonds,
`dd.MM.yyyy` dates, condition shading, and emotional-relationship connectors (drawn
directly between neighbors where possible).

## Related packages

| Package | Description |
|---------|-------------|
| [`@famtree/cli`](https://www.npmjs.com/package/@famtree/cli) | `famtree` command-line renderer |
| [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) | JSON Schema + TypeScript types |
| [`@famtree/validate`](https://www.npmjs.com/package/@famtree/validate) | Optional Ajv-backed schema validation |
| [`@famtree/core`](https://www.npmjs.com/package/@famtree/core) | Domain graph + layout engine |

## License

MIT © Felipe Plets
