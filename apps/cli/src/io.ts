// famtree CLI input/output helpers.

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import type { RenderStats } from "@famtree/renderer"

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

function writeOutput(svg: string, stats: RenderStats, output?: string): void {
  if (output) {
    writeFileSync(output, svg)
    process.stderr.write(
      `Rendered ${stats.people} people, ${stats.unions} unions, ${stats.emotions} emotional ties ` +
        `-> ${output} (${stats.width}x${stats.height})\n`,
    )
  } else {
    process.stdout.write(svg)
  }
}

export { packageVersion, readInput, writeOutput }
