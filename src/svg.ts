// A tiny SVG element builder. Centralizes all markup generation so the rest of
// the renderer never hand-writes SVG strings (DRY / Single Responsibility).

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

class Svg {
  private readonly els: string[] = []

  /** Append a pre-built element (escape hatch for one-off markup). */
  raw(el: string): this {
    this.els.push(el)
    return this
  }

  line(x1: number, y1: number, x2: number, y2: number, attr = ""): this {
    return this.raw(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${attr}/>`,
    )
  }

  rect(x: number, y: number, w: number, h: number, attr: string): this {
    return this.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attr}/>`)
  }

  circle(cx: number, cy: number, r: number, attr: string): this {
    return this.raw(`<circle cx="${cx}" cy="${cy}" r="${r}" ${attr}/>`)
  }

  polygon(points: string, attr: string): this {
    return this.raw(`<polygon points="${points}" ${attr}/>`)
  }

  path(d: string, attr: string): this {
    return this.raw(`<path d="${d}" ${attr}/>`)
  }

  text(x: number, y: number, content: string, attr: string): this {
    return this.raw(`<text x="${x}" y="${y}" ${attr}>${esc(content)}</text>`)
  }

  /** Serialize collected elements, one per line. */
  toString(): string {
    return this.els.join("\n")
  }
}

export { esc, Svg }
