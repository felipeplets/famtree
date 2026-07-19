// famtree CLI argument parsing.

import { HELP } from "./usage"

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

export { parseArgs, HELP }
export type { CliOptions }
