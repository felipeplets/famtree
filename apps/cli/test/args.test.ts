import { expect, test, describe } from "bun:test"
import { parseArgs } from "../src/args"

describe("parseArgs", () => {
  test("defaults with no args", () => {
    const opts = parseArgs([])
    expect(opts).toEqual({ validate: false, help: false, version: false })
    expect(opts.input).toBeUndefined()
    expect(opts.output).toBeUndefined()
    expect(opts.title).toBeUndefined()
  })

  test("positional input", () => {
    expect(parseArgs(["family.json"]).input).toBe("family.json")
  })

  test('treats "-" as input (stdin sentinel)', () => {
    expect(parseArgs(["-"]).input).toBe("-")
  })

  test("-o and --output set output", () => {
    expect(parseArgs(["-o", "out.svg"]).output).toBe("out.svg")
    expect(parseArgs(["--output", "out.svg"]).output).toBe("out.svg")
  })

  test("-t and --title set title", () => {
    expect(parseArgs(["-t", "My Family"]).title).toBe("My Family")
    expect(parseArgs(["--title", "My Family"]).title).toBe("My Family")
  })

  test("--validate flag", () => {
    expect(parseArgs(["--validate"]).validate).toBe(true)
  })

  test("-h and --help flags", () => {
    expect(parseArgs(["-h"]).help).toBe(true)
    expect(parseArgs(["--help"]).help).toBe(true)
  })

  test("-v and --version flags", () => {
    expect(parseArgs(["-v"]).version).toBe(true)
    expect(parseArgs(["--version"]).version).toBe(true)
  })

  test("combines input, output, title and flags", () => {
    const opts = parseArgs(["family.json", "--validate", "-o", "out.svg", "-t", "Fam"])
    expect(opts.input).toBe("family.json")
    expect(opts.output).toBe("out.svg")
    expect(opts.title).toBe("Fam")
    expect(opts.validate).toBe(true)
  })

  test("throws on unknown option", () => {
    expect(() => parseArgs(["--nope"])).toThrow("Unknown option: --nope")
  })

  test("throws on unexpected second positional", () => {
    expect(() => parseArgs(["a.json", "b.json"])).toThrow("Unexpected argument: b.json")
  })
})
