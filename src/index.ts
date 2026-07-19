// Public API for the famtree package.
//
// famtree renders a genogram document (see famtree.schema.json) to SVG.
// The core is dependency-free and runtime-agnostic (works on Node and Bun).

import { GenogramRenderer, type RenderResult, type RenderStats } from "./renderer";
import type { Genogram } from "./types";

export { GenogramRenderer } from "./renderer";
export type { RenderResult, RenderStats } from "./renderer";

export { GenogramGraph } from "./graph";
export { GenerationalLayout, Positions, type LayoutEngine } from "./layout";
export { Svg, esc } from "./svg";

export * from "./types";

/**
 * Render a genogram document to an SVG string.
 *
 * @param doc A genogram document compliant with `famtree.schema.json`.
 * @returns The SVG markup plus summary statistics.
 */
export function renderGenogram(doc: Genogram): RenderResult {
  return new GenogramRenderer().render(doc);
}

/** Re-export the aggregated types under a namespace-friendly alias. */
export type { Genogram, RenderResult as FamtreeRenderResult, RenderStats as FamtreeRenderStats };
