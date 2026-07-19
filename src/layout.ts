// Layout: turns a GenogramGraph into concrete x/y coordinates.
// `LayoutEngine` is an abstraction so the renderer can depend on it rather than a
// concrete algorithm (Dependency Inversion / Open-Closed for new strategies).

import type { GenogramGraph } from "./graph";
import type { UnionRelationship } from "./genogram";
import { GEN_SPACING, MARGIN, R, SIB_STEP, SPOUSE_HALF } from "./constants";

/** Resolved coordinates for a laid-out genogram. */
export class Positions {
  constructor(
    private readonly graph: GenogramGraph,
    private readonly xOf: Map<string, number>,
  ) {}

  cx(id: string): number {
    return this.xOf.get(id)! + MARGIN + R;
  }

  cy(id: string): number {
    return this.graph.generationOf(id) * GEN_SPACING + MARGIN + R;
  }

  bounds(): { width: number; height: number } {
    const ids = this.graph.roster.map((p) => p.id);
    return {
      width: Math.max(...ids.map((id) => this.cx(id))) + MARGIN + 60,
      height: Math.max(...ids.map((id) => this.cy(id))) + MARGIN + 60,
    };
  }
}

export interface LayoutEngine {
  layout(graph: GenogramGraph): Positions;
}

/**
 * Places couples centered above their children, oldest sibling to the left,
 * married-in spouses to the right of the blood relative. Honors explicit
 * `layout.positions` overrides from the document.
 */
export class GenerationalLayout implements LayoutEngine {
  private graph!: GenogramGraph;
  private xOf!: Map<string, number>;
  private placedUnion!: Set<string>;
  private cursor = 0;

  layout(graph: GenogramGraph): Positions {
    this.graph = graph;
    this.xOf = new Map();
    this.placedUnion = new Set();
    this.cursor = 0;

    // Place ancestors (people with no parents) first; couples before singles.
    const roots = graph.roster
      .map((p) => p.id)
      .filter((id) => graph.parentsOf(id).length === 0)
      .sort((a, b) => (graph.unionHeadedBy(a) ? 0 : 1) - (graph.unionHeadedBy(b) ? 0 : 1));
    for (const id of roots) this.placeSubtree(id);
    for (const p of graph.roster) if (!this.xOf.has(p.id)) this.placeSubtree(p.id);

    for (const pos of graph.doc.layout?.positions ?? []) {
      this.xOf.set(pos.personId, pos.x);
    }
    return new Positions(graph, this.xOf);
  }

  private placeSubtree(id: string): number {
    const existing = this.xOf.get(id);
    if (existing !== undefined) return existing;

    const union = this.graph.unionHeadedBy(id);
    if (union && !this.placedUnion.has(union.id)) return this.placeUnion(union, id);

    const kids = this.graph.sortByBirth(this.graph.singleChildrenOf(id));
    if (kids.length) {
      const x = this.centerOver(kids);
      this.xOf.set(id, x);
      return x;
    }
    const x = this.cursor;
    this.cursor += SIB_STEP;
    this.xOf.set(id, x);
    return x;
  }

  private placeUnion(union: UnionRelationship, anchor: string): number {
    this.placedUnion.add(union.id);
    const other = union.partnerIds.find((p) => p !== anchor)!;
    const kids = this.graph.sortByBirth(this.graph.childrenOfUnion(union.id));

    let center: number;
    if (kids.length) {
      center = this.centerOver(kids);
    } else {
      center = this.cursor + SIB_STEP / 2;
      this.cursor += SIB_STEP * 2;
    }
    this.xOf.set(anchor, center - SPOUSE_HALF);
    this.xOf.set(other, center + SPOUSE_HALF);
    this.cursor = Math.max(this.cursor, center + SPOUSE_HALF + SIB_STEP);
    return center;
  }

  private centerOver(ids: string[]): number {
    const xs = ids.map((k) => this.placeSubtree(k));
    return (xs[0] + xs[xs.length - 1]) / 2;
  }
}
