#!/usr/bin/env bun
// CLI entry point: reads a genogram JSON document and writes an SVG.
//   bun render.ts [input.json] [output.svg]

import type { Genogram } from "./genogram";
import { GenogramRenderer } from "./renderer";

const inPath = process.argv[2] ?? "examples/example.genogram.json";
const outPath = process.argv[3] ?? "examples/genogram.svg";

const doc: Genogram = JSON.parse(await Bun.file(inPath).text());
const { svg, stats } = new GenogramRenderer().render(doc);

await Bun.write(outPath, svg);
console.log(
  `Rendered ${stats.people} people, ${stats.unions} unions, ${stats.emotions} emotional ties ` +
  `-> ${outPath} (${stats.width}x${stats.height})`,
);
