# Genogram

A [JSON Schema](./genogram.schema.json) for describing genograms — family diagrams
capturing individuals, their biological/legal relationships, and their emotional
bonds — plus a small [Bun](https://bun.sh)-powered renderer that turns a compliant
document into an SVG.

![Example genogram](./examples/genogram.png)

## Requirements

- [Bun](https://bun.sh) 1.3+

## Usage

```bash
# render the bundled example -> examples/genogram.svg
bun run example

# render an arbitrary document
bun src/render.ts path/to/input.json path/to/output.svg
```

## The schema

`genogram.schema.json` (JSON Schema Draft 2020-12) describes a document with three
top-level parts:

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

## Architecture

The renderer is split into focused modules under `src/`:

| Module | Responsibility |
|--------|----------------|
| `genogram.ts` | TypeScript types mirroring the schema |
| `constants.ts` | Shared geometry constants |
| `svg.ts` | SVG element builder |
| `graph.ts` | Indexed family-structure model + generation ranking |
| `layout.ts` | `LayoutEngine` abstraction + generational layout |
| `shapes.ts` | Node-shape strategies keyed by sex |
| `bonds.ts` | Emotional-bond style registry |
| `renderer.ts` | Orchestrates the above into an SVG |
| `render.ts` | CLI entry point |

## License

[MIT](./LICENSE)
