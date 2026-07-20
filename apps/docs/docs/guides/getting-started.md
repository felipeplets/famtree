---
id: getting-started
title: Getting started
sidebar_position: 1
---

# Getting started

This guide takes you from an empty folder to a rendered genogram SVG.

## Requirements

- **Node ≥ 18** or **Bun**. The renderer itself has zero runtime dependencies.

## Install the CLI

```bash
npm install -g @famtree/cli
```

Or run it once without installing anything:

```bash
npx @famtree/cli family.json -o family.svg
```

## Author a document

Create `family.json` with a minimal family — two married parents and a child:

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

See **[The genogram document](document.md)** for a full tour of the format, or the
**[schema reference](../reference/schema.md)** for every field.

## Render it

```bash
famtree family.json -o family.svg
```

When you write to a file, a one-line summary is printed to **stderr**:

```
Rendered 3 people, 1 unions, 0 emotional ties -> family.svg (WxH)
```

Open `family.svg` in any browser or vector editor.

## Validate as you go (optional)

Pass `--validate` to check the document against the JSON Schema before rendering.
Validation uses [Ajv](https://ajv.js.org/), an **optional** peer dependency:

```bash
npm install -g @famtree/cli ajv
famtree family.json --validate -o family.svg
```

Rendering without `--validate` never requires `ajv`.

## Next steps

- **[The genogram document](document.md)** — author unions, divorces, twins,
  adoptions, conditions, and emotional bonds.
- **[Rendering & output](rendering.md)** — stdin/stdout, PNG conversion, exit codes.
- **[Packages](packages.md)** — use the renderer programmatically.
