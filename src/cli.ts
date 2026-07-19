#!/usr/bin/env node
// famtree CLI — render a genogram JSON document to SVG.
//
// Usage:
//   famtree <input.json> [-o output.svg]   render a file
//   famtree < input.json > output.svg      read stdin, write stdout
//   cat input.json | famtree --validate    validate + render
//
// Runtime-agnostic: uses Node's fs/process APIs (also runs under Bun).

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { renderGenogram } from "./index"
import type { Genogram } from "./types"

const HELP = `famtree — render a genogram JSON document to SVG

Usage:
  famtree [input.json] [options]

Arguments:
  input.json            Path to a genogram document. Reads stdin if omitted or "-".

Options:
  -o, --output <file>   Write SVG to <file>. Writes stdout if omitted.
  -t, --title <title>   Override the document title.
      --validate        Validate the document against the schema before rendering.
  -h, --help            Show this help.
  -v, --version         Show the version.

Examples:
  famtree family.json -o family.svg
  cat family.json | famtree > family.svg
  famtree family.json --validate -o family.svg
`

interface CliOptions {
  input?: string
  output?: string
  title?: string
  validate: boolean
  help: boolean
  version: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { validate: false, help: false, version: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case "-h":
      case "--help":
        opts.help = true
        break
      case "-v":
      case "--version":
        opts.version = true
        break
      case "--validate":
        opts.validate = true
        break
      case "-o":
      case "--output":
        opts.output = argv[++i]
        break
      case "-t":
      case "--title":
        opts.title = argv[++i]
        break
      default:
        if (arg.startsWith("-") && arg !== "-") {
          throw new Error(`Unknown option: ${arg}`)
        }
        if (opts.input === undefined) opts.input = arg
        else throw new Error(`Unexpected argument: ${arg}`)
    }
  }
  return opts
}

function packageVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    const pkg = JSON.parse(readFileSync(resolve(here, "../package.json"), "utf8"))
    return pkg.version ?? "0.0.0"
  } catch {
    return "0.0.0"
  }
}

function readInput(input?: string): string {
  if (!input || input === "-") return readFileSync(0, "utf8") // fd 0 = stdin
  return readFileSync(input, "utf8")
}

async function validate(doc: unknown): Promise<void> {
  let Ajv2020: typeof import("ajv/dist/2020").default
  try {
    // Explicit .js extension required for Node ESM resolution.
    Ajv2020 = (await import("ajv/dist/2020.js")).default
  } catch {
    throw new Error("The --validate flag requires the optional 'ajv' dependency. Install it with: npm i ajv")
  }
  const here = dirname(fileURLToPath(import.meta.url))
  const schema = JSON.parse(readFileSync(resolve(here, "../famtree.schema.json"), "utf8"))
  const ajv = new Ajv2020({ allErrors: true, strict: false, logger: false })
  const check = ajv.compile(schema)
  if (!check(doc)) {
    const details = (check.errors ?? []).map((e) => `  • ${e.instancePath || "(root)"} ${e.message}`).join("\n")
    throw new Error(`Document does not match famtree.schema.json:\n${details}`)
  }
}

async function main(): Promise<number> {
  let opts: CliOptions
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (err) {
    process.stderr.write(`${(err as Error).message}\n\n${HELP}`)
    return 2
  }

  if (opts.help) {
    process.stdout.write(HELP)
    return 0
  }
  if (opts.version) {
    process.stdout.write(`${packageVersion()}\n`)
    return 0
  }

  let doc: Genogram
  try {
    doc = JSON.parse(readInput(opts.input)) as Genogram
  } catch (err) {
    process.stderr.write(`Failed to read input: ${(err as Error).message}\n`)
    return 1
  }

  if (opts.validate) {
    try {
      await validate(doc)
    } catch (err) {
      process.stderr.write(`${(err as Error).message}\n`)
      return 1
    }
  }

  if (opts.title) {
    doc.metadata = { ...doc.metadata, title: opts.title }
  }

  const { svg, stats } = renderGenogram(doc)

  if (opts.output) {
    writeFileSync(opts.output, svg)
    process.stderr.write(
      `Rendered ${stats.people} people, ${stats.unions} unions, ${stats.emotions} emotional ties ` +
        `-> ${opts.output} (${stats.width}x${stats.height})\n`,
    )
  } else {
    process.stdout.write(svg)
  }
  return 0
}

main().then((code) => process.exit(code))
