import { expect, test, describe } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderGenogram, GenogramRenderer } from "../src/index"
import type { Genogram } from "../src/index"

const root = resolve(import.meta.dir, "..")
const example = JSON.parse(readFileSync(resolve(root, "examples/example.genogram.json"), "utf8")) as Genogram

describe("renderGenogram", () => {
  test("renders the example document to non-empty SVG", () => {
    const { svg, stats } = renderGenogram(example)
    expect(svg.startsWith("<svg")).toBe(true)
    expect(svg.includes("</svg>")).toBe(true)
    expect(stats.people).toBe(example.people.length)
    expect(stats.width).toBeGreaterThan(0)
    expect(stats.height).toBeGreaterThan(0)
  })

  test("is deterministic", () => {
    const a = renderGenogram(example).svg
    const b = new GenogramRenderer().render(example).svg
    expect(a).toBe(b)
  })

  test("counts unions and emotional ties", () => {
    const { stats } = renderGenogram(example)
    expect(stats.unions).toBe(2)
    expect(stats.emotions).toBe(3)
  })

  test("renders a minimal document", () => {
    const doc: Genogram = {
      version: "1.0.0",
      people: [
        { id: "a", sex: "male" },
        { id: "b", sex: "female" },
      ],
      relationships: [{ id: "u", type: "union", partnerIds: ["a", "b"] }],
    }
    const { svg, stats } = renderGenogram(doc)
    expect(stats.people).toBe(2)
    expect(svg).toContain("<rect")
    expect(svg).toContain("<circle")
  })
})
