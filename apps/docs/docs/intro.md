---
id: intro
title: Introduction
slug: /
sidebar_position: 1
---

# famtree

**famtree** turns a plain JSON description of a family system into a clean,
standards-based **genogram** rendered as SVG. It ships as a small set of
composable, zero-config packages under the `@famtree/*` scope and a `famtree`
command-line tool.

A _genogram_ is a graphical representation of family members, their
biological/legal relationships, and their emotional relationships — the kind of
diagram used in family therapy, medicine, and genealogy.

## Why famtree

- **A documented data contract.** Your family system is described by a single
  [JSON Schema](reference/schema.md) (Draft 2020-12). Author it by hand, generate
  it from a database, or build a UI on top — anything that emits valid JSON works.
- **Deterministic SVG output.** The renderer lays out generations automatically
  and draws shapes, unions, parent–child links, and emotional bonds using
  conventional genogram notation.
- **Composable packages.** Use the [`@famtree/cli`](guides/packages.md) for a
  one-liner, or import [`@famtree/renderer`](guides/packages.md) and
  [`@famtree/core`](guides/packages.md) directly in your own tools.
- **No lock-in.** Output is a standalone `.svg` file — open it in a browser,
  embed it, or convert it to PNG/PDF.

## Quick taste

```bash
npm install -g @famtree/cli
famtree family.json -o family.svg
```

Head to **[Getting started](guides/getting-started.md)** to render your first
genogram, or jump to the **[schema reference](reference/schema.md)** to learn the
document format.
