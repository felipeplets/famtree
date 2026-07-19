// Public API for the famtree package.
//
// famtree renders a genogram document (see famtree.schema.json) to SVG.
// The core is dependency-free and runtime-agnostic (works on Node and Bun).

import { GenogramRenderer, type RenderResult, type RenderStats } from "./renderer"
import { GenogramGraph } from "./graph"
import { GenerationalLayout, Positions, type LayoutEngine } from "./layout"
import { Svg, esc } from "./svg"
import type { Genogram } from "./types"

/**
 * Render a genogram document to an SVG string.
 *
 * @param doc A genogram document compliant with `famtree.schema.json`.
 * @returns The SVG markup plus summary statistics.
 */
function renderGenogram(doc: Genogram): RenderResult {
  return new GenogramRenderer().render(doc)
}

export * from "./types"
export { GenogramRenderer, GenogramGraph, GenerationalLayout, Positions, Svg, esc, renderGenogram }
export type {
  RenderResult,
  RenderStats,
  LayoutEngine,
  Genogram,
  RenderResult as FamtreeRenderResult,
  RenderStats as FamtreeRenderStats,
}
