// famtree CLI run orchestration.

import { renderGenogram } from "@famtree/renderer"
import { validate } from "@famtree/validate"
import type { Genogram } from "@famtree/schema"
import { parseArgs, HELP, type CliOptions } from "./args"
import { packageVersion, readInput, writeOutput } from "./io"

async function run(argv: string[]): Promise<number> {
  let opts: CliOptions
  try {
    opts = parseArgs(argv)
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
  writeOutput(svg, stats, opts.output)
  return 0
}

export { run }
