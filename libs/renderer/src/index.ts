// Public API for @famtree/renderer: SVG rendering plus a convenience wrapper.

import { GenogramRenderer } from "./renderer"
import type { RenderResult } from "./renderer"
import { Svg, esc } from "./svg"
import type { Genogram } from "@famtree/schema"

/**
 * Render a genogram document to an SVG string.
 *
 * @param doc A genogram document compliant with `@famtree/schema`.
 * @returns The SVG markup plus summary statistics.
 */
function renderGenogram(doc: Genogram): RenderResult {
  return new GenogramRenderer().render(doc)
}

export { GenogramRenderer, renderGenogram, Svg, esc }
export type { RenderResult, RenderStats } from "./renderer"
