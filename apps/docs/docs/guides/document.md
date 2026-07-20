---
id: document
title: The genogram document
sidebar_position: 2
---

# The genogram document

A genogram document is a single JSON object validated by
[`@famtree/schema`](../reference/schema.md) (JSON Schema Draft 2020-12). It has
three required parts plus optional metadata and layout hints.

```json
{
  "version": "1.0.0",
  "metadata": { "title": "The Smith Family" },
  "people": [ /* ... */ ],
  "relationships": [ /* ... */ ]
}
```

| Field           | Required | Description                                              |
|-----------------|:--------:|----------------------------------------------------------|
| `version`       |    ✅    | Document format version, e.g. `"1.0.0"`.                 |
| `people`        |    ✅    | Every individual in the family system.                   |
| `relationships` |    ✅    | Unions, parent–child links, and emotional bonds.         |
| `metadata`      |          | Title, author, dates, and the focus person (proband).    |
| `layout`        |          | Optional rendering hints (orientation, explicit positions). |

For an exhaustive field-by-field breakdown, see the
**[schema reference](../reference/schema.md)**.

## People

Each person needs a unique `id` and a `sex` (`male` → square, `female` → circle,
`unknown` → diamond). Everything else is optional annotation:

```json
{
  "id": "grandpa",
  "name": "Arthur",
  "sex": "male",
  "birthDate": "1940-02-01",
  "deathDate": "2015-06-20",
  "deceased": true,
  "conditions": [{ "name": "diabetes", "category": "medical", "status": "active" }]
}
```

Notable person flags:

- `isProband` — marks the index person the genogram centers on.
- `deceased` / `deathDate` — deceased nodes are drawn with an X through the shape.
- `isPregnancy` — drawn as a triangle.
- `twinGroupId` + `twinType` — connect twins/multiples.
- `birthOrder` — orders siblings left-to-right (oldest first).
- `conditions[]` — medical/mental-health/substance-use annotations used for shading.
- `style` — per-node `fillColor`, `borderColor`, `borderWidth` overrides.

## Relationships

`relationships` is a mixed list discriminated by `type`.

### Unions (`type: "union"`)

A partnership between exactly two `partnerIds`:

```json
{
  "id": "u1",
  "type": "union",
  "partnerIds": ["dad", "mom"],
  "unionType": "married",
  "status": "divorced",
  "startDate": "1998-05-10",
  "endDate": "2012-03-01"
}
```

- `unionType`: `married` · `engaged` · `cohabiting` · `committed` · `casual` · `unknown`
- `status`: `current` · `separated` · `divorced` · `annulled` · `widowed` · `ended`

### Parent–child (`type: "parent-child"`)

Connects a `childId` to parents — either by listing `parentIds` or by referencing
the parents' `unionId`:

```json
{ "id": "pc1", "type": "parent-child", "childId": "kid", "unionId": "u1", "biological": "adopted" }
```

- `biological`: `biological` · `adopted` · `foster` · `step` · `surrogate` · `unknown`
- `pregnancyOutcome`: `live-birth` · `miscarriage` · `stillbirth` · `abortion`

### Emotional bonds (`type: "emotional"`)

A social/emotional tie between two `personIds`, drawn with distinctive connectors:

```json
{ "id": "e1", "type": "emotional", "personIds": ["mom", "kid"], "bond": "very-close" }
```

- `bond`: `close` · `very-close` · `fused` · `distant` · `estranged` · `cutoff` ·
  `hostile` · `conflict` · `fused-hostile` · `abuse` · `neglect` · `friendship` ·
  `love` · `focused-on`
- `direction`: `mutual` (default) · `a-to-b` · `b-to-a` for asymmetric bonds.

## Layout hints

By default the renderer auto-lays-out by generation. Override with `layout`:

```json
{
  "layout": {
    "orientation": "top-down",
    "generationSpacing": 120,
    "siblingSpacing": 80,
    "positions": [{ "personId": "kid", "x": 300, "y": 200 }]
  }
}
```

## A fuller example

The repository ships a richer document exercising unions, divorces, deceased
members, twins, adoption, pregnancy outcomes, conditions, and emotional ties:
[`examples/example.genogram.json`](https://github.com/felipeplets/famtree/blob/main/examples/example.genogram.json).
