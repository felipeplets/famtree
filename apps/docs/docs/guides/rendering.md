---
id: rendering
title: Rendering & output
sidebar_position: 3
---

# Rendering & output

`famtree` reads a genogram document and writes **SVG** — a standalone vector file
you can open in a browser, embed in a page, or convert to other formats.

## Files, stdin, and stdout

```bash
# File in, file out
famtree family.json -o family.svg

# stdin in, stdout out (great for pipelines)
cat family.json | famtree > family.svg

# "-" explicitly means stdin
famtree - < family.json > family.svg
```

When you use `-o`, a one-line summary goes to **stderr** (so it never pollutes
piped SVG on stdout):

```
Rendered 9 people, 2 unions, 3 emotional ties -> family.svg (607x523)
```

## Overriding the title

```bash
famtree family.json -t "The Smith Family" -o family.svg
```

## Validation

Add `--validate` to check the document against the JSON Schema before rendering.
Validation uses [Ajv](https://ajv.js.org/), an **optional** peer dependency kept
out of the default install so pure rendering stays lean:

```bash
npm install -g @famtree/cli ajv
famtree family.json --validate -o family.svg
```

Without `ajv` installed, `--validate` exits with a message telling you to install
it. Rendering without `--validate` never requires `ajv`.

## Producing a PNG

`famtree` emits SVG. To rasterize, pipe the SVG through any SVG→PNG tool, for
example [`rsvg-convert`](https://gitlab.gnome.org/GNOME/librsvg):

```bash
famtree family.json -o family.svg && rsvg-convert family.svg -o family.png
```

:::note
Direct PNG/PDF output is [on the roadmap](https://github.com/felipeplets/famtree/issues/15).
:::

## Exit codes

| Code | Meaning                                            |
|-----:|----------------------------------------------------|
| `0`  | Success (or `--help` / `--version`)                |
| `1`  | Failed to read/parse input, or validation failed   |
| `2`  | Invalid command-line arguments                     |

## Full CLI reference

See the **[CLI reference](../reference/cli.md)** for the complete, always-current
list of arguments and options (it is generated from the CLI's own help text).
