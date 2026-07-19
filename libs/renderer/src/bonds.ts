// Emotional-bond visual vocabulary. Each bond maps to a reusable style
// descriptor; adding a bond style is a data change, not a code change (OCP).

import type { EmotionalBond } from "@famtree/schema"

interface BondStyle {
  color: string
  lines: number // number of parallel strokes
  dash?: string // stroke-dasharray value
  zig?: boolean // draw as a zigzag (conflict/hostility)
}

const BOND_STYLES: Partial<Record<EmotionalBond, BondStyle>> = {
  close: { color: "#1976d2", lines: 2 },
  "very-close": { color: "#1976d2", lines: 3 },
  fused: { color: "#1976d2", lines: 3 },
  friendship: { color: "#388e3c", lines: 1 },
  love: { color: "#d81b60", lines: 2 },
  distant: { color: "#777", lines: 1, dash: "6 6" },
  estranged: { color: "#777", lines: 1, dash: "2 6" },
  cutoff: { color: "#777", lines: 1, dash: "2 6" },
  conflict: { color: "#e53935", lines: 1, zig: true },
  hostile: { color: "#b71c1c", lines: 1, zig: true },
  "fused-hostile": { color: "#b71c1c", lines: 1, zig: true },
  abuse: { color: "#b71c1c", lines: 1, zig: true },
  neglect: { color: "#b71c1c", lines: 1, zig: true },
}

const DEFAULT_BOND: BondStyle = { color: "#555", lines: 1 }

/** Parallel-stroke offsets for a given number of lines. */
function strokeOffsets(lines: number): number[] {
  if (lines >= 3) return [-4, 0, 4]
  if (lines === 2) return [-3, 3]
  return [0]
}

function bondStyle(bond: EmotionalBond): BondStyle {
  return BOND_STYLES[bond] ?? DEFAULT_BOND
}

export { strokeOffsets, bondStyle }
export type { BondStyle }
