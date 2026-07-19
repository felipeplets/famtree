// Node shape strategies keyed by biological sex. Adding a new shape means adding
// a registry entry, not editing the renderer (Open-Closed).

import type { Sex } from "./types";
import type { Svg } from "./svg";
import { NODE } from "./constants";

export interface NodeShape {
  /** Draw the primary node outline/fill. */
  base(svg: Svg, x: number, y: number, r: number, attr: string): void;
  /** Optional larger outline drawn behind the node to mark the proband. */
  probandOutline?(svg: Svg, x: number, y: number, r: number, stroke: string): void;
}

const male: NodeShape = {
  base: (svg, x, y, r, attr) => svg.rect(x - r, y - r, NODE, NODE, attr),
  probandOutline: (svg, x, y, r, stroke) =>
    svg.rect(x - r - 4, y - r - 4, NODE + 8, NODE + 8, `fill="none" stroke="${stroke}" stroke-width="1"`),
};

const female: NodeShape = {
  base: (svg, x, y, r, attr) => svg.circle(x, y, r, attr),
  probandOutline: (svg, x, y, r, stroke) =>
    svg.circle(x, y, r + 4, `fill="none" stroke="${stroke}" stroke-width="1"`),
};

const unknown: NodeShape = {
  base: (svg, x, y, r, attr) =>
    svg.polygon(`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`, attr),
};

const SHAPES: Record<Sex, NodeShape> = { male, female, unknown };

export function shapeFor(sex: Sex): NodeShape {
  return SHAPES[sex] ?? unknown;
}
