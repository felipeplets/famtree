// Shared geometry constants for layout and rendering.
const NODE = 46 // node width / diameter
const R = NODE / 2 // node radius
const GEN_SPACING = 150 // vertical distance between generations
const SIB_STEP = 128 // horizontal step between sibling subtrees
const SPOUSE_HALF = 64 // half distance between partners in a couple
const MARGIN = 70 // outer margin / frame padding
const LABEL_WRAP = 16 // max characters per label line before wrapping
const LABEL_LINE_H = 13 // vertical distance between wrapped label lines

export { NODE, R, GEN_SPACING, SIB_STEP, SPOUSE_HALF, MARGIN, LABEL_WRAP, LABEL_LINE_H }
