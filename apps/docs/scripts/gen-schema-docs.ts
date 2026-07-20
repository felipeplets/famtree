// Generates docs/reference/schema.md from libs/schema/famtree.schema.json.
// Run from apps/docs (via `nx run docs:gen`). Do not edit the output by hand.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const SCHEMA_PATH = resolve(HERE, "../../../libs/schema/famtree.schema.json")
const OUT_PATH = resolve(HERE, "../docs/reference/schema.md")

const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"))

const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ")

const refName = (ref) => String(ref).split("/").pop()

function typeOf(prop) {
  if (!prop || typeof prop !== "object") return "—"
  if (prop.$ref) {
    const name = refName(prop.$ref)
    return `[\`${name}\`](#${name.toLowerCase()})`
  }
  if (prop.const !== undefined) return `\`"${prop.const}"\``
  if (prop.enum) return prop.enum.map((v) => `\`${v}\``).join(" · ")
  if (prop.oneOf) return prop.oneOf.map(typeOf).join(" or ")
  if (prop.type === "array") {
    const items = prop.items ? typeOf(prop.items) : "any"
    return `\`array\` of ${items}`
  }
  if (Array.isArray(prop.type)) return prop.type.map((t) => `\`${t}\``).join(" \\| ")
  if (prop.type) {
    let t = `\`${prop.type}\``
    if (prop.format) t += ` (${prop.format})`
    return t
  }
  return "`object`"
}

function constraints(prop) {
  const bits = []
  if (prop.default !== undefined) bits.push(`default: \`${JSON.stringify(prop.default)}\``)
  if (prop.minimum !== undefined) bits.push(`min: ${prop.minimum}`)
  if (prop.maximum !== undefined) bits.push(`max: ${prop.maximum}`)
  if (prop.minItems !== undefined) bits.push(`minItems: ${prop.minItems}`)
  if (prop.maxItems !== undefined) bits.push(`maxItems: ${prop.maxItems}`)
  if (prop.pattern !== undefined) bits.push(`pattern: \`${prop.pattern}\``)
  return bits.join(", ")
}

function propTable(obj) {
  const props = obj.properties ?? {}
  const required = new Set(obj.required ?? [])
  const keys = Object.keys(props)
  if (keys.length === 0) return "_No properties._\n"
  const lines = ["| Property | Type | Required | Description |", "|----------|------|:--------:|-------------|"]
  for (const key of keys) {
    const p = props[key]
    const req = required.has(key) ? "✅" : ""
    const desc = [p.description ? esc(p.description) : "", constraints(p) ? `_(${constraints(p)})_` : ""]
      .filter(Boolean)
      .join(" ")
    lines.push(`| \`${key}\` | ${typeOf(p)} | ${req} | ${desc || "—"} |`)
  }
  return lines.join("\n") + "\n"
}

let out = `---
id: schema
title: Schema reference
sidebar_position: 1
---

{/* GENERATED FILE — do not edit by hand. Source: libs/schema/famtree.schema.json.
    Regenerate with: nx run docs:gen */}

# Schema reference

> This page is generated from
> [\`libs/schema/famtree.schema.json\`](https://github.com/felipeplets/famtree/blob/main/libs/schema/famtree.schema.json)
> (JSON Schema Draft 2020-12).

**${esc(schema.title)}** — ${esc(schema.description)}

## Document root

${schema.description ? "" : ""}${propTable(schema)}
`

const defs = schema.$defs ?? {}
if (Object.keys(defs).length > 0) {
  out += `\n## Definitions\n`
  for (const [name, def] of Object.entries(defs)) {
    out += `\n### ${name}\n\n`
    if (def.description) out += `${esc(def.description)}\n\n`
    if (def.oneOf) {
      out += `One of: ${def.oneOf.map(typeOf).join(", ")}.\n\n`
      continue
    }
    out += propTable(def)
  }
}

mkdirSync(dirname(OUT_PATH), { recursive: true })
writeFileSync(OUT_PATH, out)
console.log(`Wrote ${OUT_PATH}`)
