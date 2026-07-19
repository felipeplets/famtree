// GenogramRenderer: composes the graph model, a layout engine, SVG primitives,
// and the shape/bond strategies into a finished SVG document. It orchestrates —
// the domain knowledge lives in the collaborators it depends on.

import type { EmotionalRelationship, Genogram, ParentChildRelationship, Person } from "./types";
import { GenogramGraph } from "./graph";
import { GenerationalLayout, type LayoutEngine, type Positions } from "./layout";
import { Svg, esc } from "./svg";
import { shapeFor } from "./shapes";
import { bondStyle, strokeOffsets } from "./bonds";
import { GEN_SPACING, LABEL_LINE_H, LABEL_WRAP, MARGIN, R } from "./constants";

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

/** Format an ISO date (YYYY-MM-DD, or partial) as dd.MM.yyyy. Falls back to the
 *  year alone when month/day are absent. */
function formatDate(d?: string): string | undefined {
  if (!d) return undefined;
  const [y, m, day] = d.split("-");
  if (y && m && day) return `${day}.${m}.${y}`;
  if (y && m) return `${m}.${y}`;
  return y;
}

/** Greedily wrap a label into lines no longer than `max` characters, breaking on
 *  spaces. A single word longer than `max` is kept whole on its own line. */
function wrapLabel(text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [text];
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (!line) line = w;
    else if (line.length + 1 + w.length <= max) line += ` ${w}`;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
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
    const sameGen: EmotionalRelationship[] = [];
    for (const e of graph.emotions) {
      const [a, b] = e.personIds;
      if (graph.generationOf(a) === graph.generationOf(b)) sameGen.push(e);
      else this.drawStraightBond(svg, pos, e);
    }
    this.drawRoutedBonds(svg, graph, pos, sameGen);
  }

  /** A bond drawn as a direct line/zigzag between the two symbols (used across
   *  generations, where a straight diagonal reads cleanly). */
  private drawStraightBond(svg: Svg, pos: Positions, e: EmotionalRelationship): void {
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

  /** Same-generation bonds routed below the labels: two short vertical stubs and
   *  a styled horizontal segment, packed into nested lanes so ties spanning
   *  several people don't run straight through the intervening symbols. */
  private drawRoutedBonds(
    svg: Svg, graph: GenogramGraph, pos: Positions, ties: EmotionalRelationship[],
  ): void {
    const LANE_STEP = 15;
    const byGen = new Map<number, EmotionalRelationship[]>();
    for (const e of ties) {
      const g = graph.generationOf(e.personIds[0]);
      const arr = byGen.get(g) ?? [];
      arr.push(e);
      byGen.set(g, arr);
    }

    for (const [g, list] of byGen) {
      const rowCy = g * GEN_SPACING + MARGIN + R;

      type Item = { e: EmotionalRelationship; lo: number; hi: number; lane: number };
      const items: Item[] = list
        .map((e) => {
          const [a, b] = e.personIds;
          const xa = pos.cx(a), xb = pos.cx(b);
          return { e, lo: Math.min(xa, xb), hi: Math.max(xa, xb), lane: 0 };
        })
        .sort((p, q) => p.hi - p.lo - (q.hi - q.lo));

      // Greedy lane packing: narrower spans take shallow lanes; wider spans that
      // overlap them get pushed deeper (touching endpoints are allowed).
      const lanes: Item[][] = [];
      for (const it of items) {
        let lane = 0;
        for (;;) {
          const occ = lanes[lane] ?? (lanes[lane] = []);
          if (!occ.some((o) => it.lo < o.hi && o.lo < it.hi)) {
            it.lane = lane;
            occ.push(it);
            break;
          }
          lane++;
        }
      }

      for (const it of items) {
        const base = rowCy + this.maxLabelDepth(graph, pos, g, it.lo, it.hi) + 10;
        const laneY = base + it.lane * LANE_STEP;
        const st = bondStyle(it.e.bond);
        const stub = `stroke="${st.color}" stroke-width="1.4" fill="none"`;
        svg.line(it.lo, rowCy + R, it.lo, laneY, stub);
        svg.line(it.hi, rowCy + R, it.hi, laneY, stub);

        if (st.zig) {
          svg.path(zigzag(it.lo, laneY, it.hi, laneY), `stroke="${st.color}" stroke-width="1.6" fill="none"`);
        } else {
          const dash = st.dash ? `stroke-dasharray="${st.dash}"` : "";
          for (const o of strokeOffsets(st.lines)) {
            svg.line(it.lo, laneY + o, it.hi, laneY + o, `stroke="${st.color}" stroke-width="1.6" ${dash}`);
          }
        }
      }
    }
  }

  /** Vertical distance from a generation's node centers to the bottom of the
   *  tallest label whose symbol falls within [lo, hi] (so a routed bond clears
   *  only the labels it actually passes over). */
  private maxLabelDepth(
    graph: GenogramGraph, pos: Positions, gen: number, lo = -Infinity, hi = Infinity,
  ): number {
    let max = R + 15;
    for (const p of graph.roster) {
      if (graph.generationOf(p.id) !== gen) continue;
      const x = pos.cx(p.id);
      if (x < lo || x > hi) continue;
      const lines = wrapLabel(p.name ?? p.id, LABEL_WRAP).length;
      let d = R + 15 + lines * LABEL_LINE_H;
      if (p.birthDate || p.deathDate) d += LABEL_LINE_H;
      if (p.conditions?.length) d += LABEL_LINE_H;
      if (d > max) max = d;
    }
    return max;
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
    const d = Math.SQRT1_2;                    // cos/sin of 45°
    const tipR = R + 9;                        // clear of the proband outline (R+4)
    const tipX = x - tipR * d, tipY = y - tipR * d; // top-left point just outside the symbol
    const len = 16, hl = 6, ang = Math.PI / 4; // shaft length, head length, 45° pointing in
    const tailX = tipX - d * len, tailY = tipY - d * len;
    const h1x = tipX - Math.cos(ang - 0.5) * hl, h1y = tipY - Math.sin(ang - 0.5) * hl;
    const h2x = tipX - Math.cos(ang + 0.5) * hl, h2y = tipY - Math.sin(ang + 0.5) * hl;
    svg.line(tailX, tailY, tipX, tipY, STROKE);
    svg.path(
      `M ${h1x.toFixed(1)} ${h1y.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${h2x.toFixed(1)} ${h2y.toFixed(1)}`,
      STROKE,
    );
  }

  private drawDeceasedCross(svg: Svg, x: number, y: number, stroke: string, sw: number): void {
    svg.line(x - R, y - R, x + R, y + R, `stroke="${stroke}" stroke-width="${sw}"`);
    svg.line(x + R, y - R, x - R, y + R, `stroke="${stroke}" stroke-width="${sw}"`);
  }

  private drawLabels(svg: Svg, p: Person, x: number, y: number): void {
    const yrs = [formatDate(p.birthDate), formatDate(p.deathDate)].filter(Boolean).join("–");
    const nameLines = wrapLabel(p.name ?? p.id, LABEL_WRAP);
    let ty = y + R + 15;
    for (const line of nameLines) {
      svg.text(x, ty, line, `text-anchor="middle" font-size="12" font-weight="600" fill="#111"`);
      ty += LABEL_LINE_H;
    }
    let below = ty + 1;
    if (yrs) {
      svg.text(x, below, yrs, `text-anchor="middle" font-size="10" fill="#555"`);
      below += LABEL_LINE_H;
    }
    const cond = (p.conditions ?? []).map((c) => c.name).join(", ");
    if (cond) svg.text(x, below, cond, `text-anchor="middle" font-size="9" fill="#777"`);
  }
}
