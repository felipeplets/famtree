# @famtree/cli

[![npm](https://img.shields.io/npm/v/@famtree/cli.svg)](https://www.npmjs.com/package/@famtree/cli)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/felipeplets/famtree/blob/main/LICENSE)

Render a **genogram** — a family diagram capturing individuals, their biological/legal
relationships, and their emotional bonds — from a JSON document to a clean, standalone **SVG**.

`famtree` is the command-line entry point of the [famtree](https://github.com/felipeplets/famtree)
project. It reads a document compliant with [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema)
and writes SVG, with optional schema validation.

Runs on **Node ≥ 18** and **Bun**. The renderer has zero runtime dependencies.

![Example genogram](https://raw.githubusercontent.com/felipeplets/famtree/main/examples/genogram.png)

## Install

```bash
npm install -g @famtree/cli
# or run once, without installing:
npx @famtree/cli family.json -o family.svg
```

## Usage

```
famtree [input.json] [options]

Arguments:
  input.json            Path to a genogram document. Reads stdin if omitted or "-".

Options:
  -o, --output <file>   Write SVG to <file>. Writes stdout if omitted.
  -t, --title <title>   Override the document title.
      --validate        Validate the document against the schema before rendering.
  -h, --help            Show this help.
  -v, --version         Show the version.
```

### Examples

```bash
# Render a file to an SVG file
famtree family.json -o family.svg

# Pipe in via stdin, capture SVG via stdout
cat family.json | famtree > family.svg

# Validate against the JSON Schema before rendering
famtree family.json --validate -o family.svg

# Override the document title at render time
famtree family.json -t "The Smith Family" -o family.svg
```

When you write to a file with `-o`, a one-line summary is printed to **stderr**:

```
Rendered 9 people, 2 unions, 3 emotional ties -> family.svg (607x523)
```

## Input

The input is a genogram document. A minimal example:

```json
{
  "version": "1.0.0",
  "metadata": { "title": "Minimal Family", "focusPersonId": "kid" },
  "people": [
    { "id": "dad", "name": "John", "sex": "male", "birthDate": "1970-04-12" },
    { "id": "mom", "name": "Jane", "sex": "female", "birthDate": "1972-09-30" },
    { "id": "kid", "name": "Alex", "sex": "male", "birthDate": "2001-01-05", "isProband": true }
  ],
  "relationships": [
    { "id": "u1", "type": "union", "partnerIds": ["dad", "mom"], "unionType": "married" },
    { "id": "pc1", "type": "parent-child", "childId": "kid", "unionId": "u1" }
  ]
}
```

See the [full JSON Schema](https://github.com/felipeplets/famtree/blob/main/libs/schema/famtree.schema.json)
and a richer [example document](https://github.com/felipeplets/famtree/blob/main/examples/example.genogram.json)
for unions, divorces, deceased members, twins, adoption, pregnancy outcomes, conditions,
and emotional relationships.

## Validation

`--validate` checks the document against the JSON Schema using [Ajv](https://ajv.js.org/),
which is an **optional peer dependency** kept out of the default install so pure rendering
stays lean. If you use `--validate`, install `ajv` alongside the CLI:

```bash
npm install -g @famtree/cli ajv
```

Without `ajv` installed, `--validate` exits with a message telling you to install it.
Rendering without `--validate` never requires `ajv`.

## Producing a PNG

`famtree` emits SVG. To rasterize, pipe the SVG through any SVG→PNG tool, e.g.
[`rsvg-convert`](https://gitlab.gnome.org/GNOME/librsvg):

```bash
famtree family.json -o family.svg && rsvg-convert family.svg -o family.png
```

> Direct PNG/PDF output is [on the roadmap](https://github.com/felipeplets/famtree/issues/15).

## Exit codes

| Code | Meaning                                   |
|-----:|-------------------------------------------|
| `0`  | Success (or `--help` / `--version`)       |
| `1`  | Failed to read/parse input, or validation failed |
| `2`  | Invalid command-line arguments            |

## Related packages

| Package | Description |
|---------|-------------|
| [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema) | JSON Schema + TypeScript types for genogram documents |
| [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer) | SVG renderer (`renderGenogram()`) |
| [`@famtree/validate`](https://www.npmjs.com/package/@famtree/validate) | Optional Ajv-backed schema validation |
| [`@famtree/core`](https://www.npmjs.com/package/@famtree/core) | Domain graph + layout engine (internal building block) |

## License

MIT © Felipe Plets
