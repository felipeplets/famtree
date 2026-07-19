// GenogramRenderer: composes the graph model, a layout engine, SVG primitives,
// and the shape/bond strategies into a finished SVG document. It orchestrates —
// the domain knowledge lives in the collaborators it depends on.

import type { Genogram, ParentChildRelationship, Person } from "./genogram";
import { GenogramGraph } from "./graph";
import { GenerationalLayout, type LayoutEngine, type Positions } from "./layout";
import { Svg, esc } from "./svg";
import { shapeFor } from "./shapes";
import { bondStyle, strokeOffsets } from "./bonds";
import { GEN_SPACING, MARGIN, R } from "./constants";

const STROKE = `stroke="#222" stroke-width="2" fill="none"`;

export interface RenderStats {
  people: number;
  unions: number;
  emotions: number;
  width: number;
  height: number;
}

export interface RenderResult {
  svg: string;
  stats: RenderStats;
}

function year(d?: string): string | undefined {
  return d ? d.slice(0, 4) : undefined;
}

/** Dashed stroke for non-biological (adopted/foster/step) parent links. */
function adoptionDash(pc: ParentChildRelationship): string {
  return pc.biological && pc.biological !== "biological" ? `stroke-dasharray="5 4"` : "";
}

function zigzag(x1: number, y1: number, x2: number, y2: number): string {
  const segs = 12, amp = 6;
  const dx = (x2 - x1) / segs, dy = (y2 - y1) / segs;
  const nx = -(y2 - y1), ny = x2 - x1;
  const nl = Math.hypot(nx, ny) || 1;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < segs; i++) {
    const s = i % 2 === 0 ? amp : -amp;
    d += ` L ${(x1 + dx * i + (nx / nl) * s).toFixed(1)} ${(y1 + dy * i + (ny / nl) * s).toFixed(1)}`;
  }
  return d + ` L ${x2} ${y2}`;
}

export class GenogramRenderer {
  constructor(private readonly layoutEngine: LayoutEngine = new GenerationalLayout()) {}

  render(doc: Genogram): RenderResult {
    const graph = new GenogramGraph(doc);
    const pos = this.layoutEngine.layout(graph);
    const svg = new Svg();

    this.drawUnions(svg, graph, pos);
    this.drawSingleParentLinks(svg, graph, pos);
    this.drawEmotional(svg, graph, pos);
    for (const person of graph.roster) this.drawNode(svg, graph, pos, person);

    const { width, height } = pos.bounds();
    const title = doc.metadata?.title ?? "Genogram";
    const w = width.toFixed(0), h = height.toFixed(0);
    const document = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Helvetica, Arial, sans-serif">`,
      `<rect width="100%" height="100%" fill="#fafafa"/>`,
      `<text x="${MARGIN}" y="34" font-size="18" font-weight="700" fill="#111">${esc(title)}</text>`,
      svg.toString(),
      `</svg>`,
    ].join("\n");

    return {
      svg: document,
      stats: {
        people: graph.roster.length,
        unions: graph.unions.length,
        emotions: graph.emotions.length,
        width: Math.round(width),
        height: Math.round(height),
      },
    };
  }

  private drawUnions(svg: Svg, graph: GenogramGraph, pos: Positions): void {
    for (const u of graph.unions) {
      const [a, b] = u.partnerIds;
      const [left, right] = pos.cx(a) < pos.cx(b) ? [a, b] : [b, a];
      const lx = pos.cx(left) + R, rx = pos.cx(right) - R;
      const y = Math.max(pos.cy(a), pos.cy(b));

      svg.line(pos.cx(left), pos.cy(left), pos.cx(left), y, STROKE);
      svg.line(pos.cx(right), pos.cy(right), pos.cx(right), y, STROKE);
      svg.line(lx, y, rx, y, STROKE);

      const mx = (lx + rx) / 2;
      this.drawUnionStatusMark(svg, u.status, mx, y);
      this.drawChildBus(svg, graph, pos, u.id, mx, y);
    }
  }

  private drawUnionStatusMark(svg: Svg, status: string | undefined, mx: number, y: number): void {
    if (status === "divorced" || status === "annulled") {
      svg.line(mx - 10, y - 10, mx - 2, y + 10, STROKE);
      svg.line(mx + 2, y - 10, mx + 10, y + 10, STROKE);
    } else if (status === "separated" || status === "ended") {
      svg.line(mx - 4, y - 10, mx + 4, y + 10, STROKE);
    }
  }

  private drawChildBus(
    svg: Svg, graph: GenogramGraph, pos: Positions, unionId: string, mx: number, y: number,
  ): void {
    const kids = graph.childrenOfUnion(unionId);
    if (!kids.length) return;
    const busY = y + GEN_SPACING / 2;
    svg.line(mx, y, mx, busY, STROKE);
    const kxs = kids.map((k) => pos.cx(k));
    svg.line(Math.min(...kxs), busY, Math.max(...kxs), busY, STROKE);
    for (const k of kids) {
      const dash = adoptionDash(graph.parentLinkOf(k)!);
      svg.line(pos.cx(k), busY, pos.cx(k), pos.cy(k) - R, `${STROKE} ${dash}`);
    }
  }

  private drawSingleParentLinks(svg: Svg, graph: GenogramGraph, pos: Positions): void {
    for (const pc of graph.parentChild) {
      if (pc.unionId) continue;
      const dash = adoptionDash(pc);
      for (const parent of pc.parentIds ?? []) {
        const my = (pos.cy(parent) + pos.cy(pc.childId)) / 2;
        svg.line(pos.cx(parent), pos.cy(parent) + R, pos.cx(parent), my, `${STROKE} ${dash}`);
        svg.line(pos.cx(parent), my, pos.cx(pc.childId), my, `${STROKE} ${dash}`);
        svg.line(pos.cx(pc.childId), my, pos.cx(pc.childId), pos.cy(pc.childId) - R, `${STROKE} ${dash}`);
      }
    }
  }

  private drawEmotional(svg: Svg, graph: GenogramGraph, pos: Positions): void {
    for (const e of graph.emotions) {
      const [a, b] = e.personIds;
      const st = bondStyle(e.bond);
      const x1 = pos.cx(a), y1 = pos.cy(a), x2 = pos.cx(b), y2 = pos.cy(b);

      if (st.zig) {
        svg.path(zigzag(x1, y1, x2, y2), `stroke="${st.color}" stroke-width="1.6" fill="none"`);
      } else {
        const nx = -(y2 - y1), ny = x2 - x1;
        const nl = Math.hypot(nx, ny) || 1;
        for (const o of strokeOffsets(st.lines)) {
          const ox = (nx / nl) * o, oy = (ny / nl) * o;
          const dash = st.dash ? `stroke-dasharray="${st.dash}"` : "";
          svg.line(x1 + ox, y1 + oy, x2 + ox, y2 + oy, `stroke="${st.color}" stroke-width="1.6" ${dash}`);
        }
      }
      this.drawBondArrow(svg, e.direction, st.color, x1, y1, x2, y2);
    }
  }

  private drawBondArrow(
    svg: Svg, direction: string | undefined, color: string,
    x1: number, y1: number, x2: number, y2: number,
  ): void {
    if (!direction || direction === "mutual") return;
    const [fx, fy, tx, ty] = direction === "a-to-b" ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
    const ang = Math.atan2(ty - fy, tx - fx);
    const ax = tx - Math.cos(ang) * (R + 4), ay = ty - Math.sin(ang) * (R + 4);
    const d = `M ${ax} ${ay} L ${(ax - Math.cos(ang - 0.4) * 10).toFixed(1)} ${(ay - Math.sin(ang - 0.4) * 10).toFixed(1)} ` +
      `M ${ax} ${ay} L ${(ax - Math.cos(ang + 0.4) * 10).toFixed(1)} ${(ay - Math.sin(ang + 0.4) * 10).toFixed(1)}`;
    svg.path(d, `stroke="${color}" stroke-width="1.6" fill="none"`);
  }

  private drawNode(svg: Svg, graph: GenogramGraph, pos: Positions, p: Person): void {
    const x = pos.cx(p.id), y = pos.cy(p.id);
    const stroke = p.style?.borderColor ?? "#222";
    const sw = p.style?.borderWidth ?? 2;
    const outcome = graph.parentLinkOf(p.id)?.pregnancyOutcome;

    if (outcome && outcome !== "live-birth") {
      this.drawPregnancyLoss(svg, x, y, p.name ?? outcome, outcome, stroke, sw);
      return;
    }

    const fill = p.style?.fillColor ?? p.conditions?.[0]?.color ?? "#ffffff";
    if (p.isProband) this.drawProbandMarker(svg, p, x, y, stroke);
    shapeFor(p.sex).base(svg, x, y, R, `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"`);
    if (p.deceased || p.deathDate) this.drawDeceasedCross(svg, x, y, stroke, sw);
    this.drawLabels(svg, p, x, y);
  }

  private drawPregnancyLoss(
    svg: Svg, x: number, y: number, label: string, outcome: string, stroke: string, sw: number,
  ): void {
    const s = 14;
    const points = outcome === "stillbirth"
      ? `${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`
      : `${x},${y - s} ${x + s},${y + s} ${x - s},${y + s}`;
    svg.polygon(points, `fill="#eee" stroke="${stroke}" stroke-width="${sw}"`);
    svg.line(x - s, y - s, x + s, y + s, `stroke="${stroke}" stroke-width="${sw}"`);
    svg.line(x + s, y - s, x - s, y + s, `stroke="${stroke}" stroke-width="${sw}"`);
    svg.text(x, y + s + 16, label, `text-anchor="middle" font-size="11" fill="#333"`);
  }

  private drawProbandMarker(svg: Svg, p: Person, x: number, y: number, stroke: string): void {
    shapeFor(p.sex).probandOutline?.(svg, x, y, R, stroke);
    svg.path(`M ${x - R - 24} ${y + R + 24} L ${x - R - 2} ${y + R + 2}`, STROKE);
    svg.path(`M ${x - R - 2} ${y + R + 2} l -10 0 m 10 0 l 0 -10`, STROKE);
  }

  private drawDeceasedCross(svg: Svg, x: number, y: number, stroke: string, sw: number): void {
    svg.line(x - R, y - R, x + R, y + R, `stroke="${stroke}" stroke-width="${sw}"`);
    svg.line(x + R, y - R, x - R, y + R, `stroke="${stroke}" stroke-width="${sw}"`);
  }

  private drawLabels(svg: Svg, p: Person, x: number, y: number): void {
    const yrs = [year(p.birthDate), year(p.deathDate)].filter(Boolean).join("–");
    svg.text(x, y + R + 15, p.name ?? p.id, `text-anchor="middle" font-size="12" font-weight="600" fill="#111"`);
    if (yrs) svg.text(x, y + R + 29, yrs, `text-anchor="middle" font-size="10" fill="#555"`);
    const cond = (p.conditions ?? []).map((c) => c.name).join(", ");
    if (cond) svg.text(x, y + R + (yrs ? 42 : 29), cond, `text-anchor="middle" font-size="9" fill="#777"`);
  }
}
