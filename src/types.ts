// Type definitions matching genogram.schema.json (Draft 2020-12).

interface Genogram {
  version: string
  metadata?: {
    title?: string
    description?: string
    author?: string
    createdAt?: string
    updatedAt?: string
    focusPersonId?: string
  }
  people: Person[]
  relationships: Relationship[]
  layout?: Layout
}

type Sex = "male" | "female" | "unknown"

interface Person {
  id: string
  name?: string
  sex: Sex
  gender?: string
  birthDate?: string
  deathDate?: string
  deceased?: boolean
  isProband?: boolean
  isPregnancy?: boolean
  birthOrder?: number
  twinGroupId?: string
  twinType?: "identical" | "fraternal"
  conditions?: Condition[]
  labels?: string[]
  notes?: string
  style?: NodeStyle
}

interface Condition {
  name: string
  category?: "medical" | "mental-health" | "substance-use" | "developmental" | "other"
  status?: "active" | "in-remission" | "resolved" | "at-risk" | "carrier"
  ageOfOnset?: number
  color?: string
}

interface NodeStyle {
  fillColor?: string
  borderColor?: string
  borderWidth?: number
}

type Relationship = UnionRelationship | ParentChildRelationship | EmotionalRelationship

interface UnionRelationship {
  id: string
  type: "union"
  partnerIds: [string, string]
  unionType?: "married" | "engaged" | "cohabiting" | "committed" | "casual" | "unknown"
  status?: "current" | "separated" | "divorced" | "annulled" | "widowed" | "ended"
  startDate?: string
  endDate?: string
  notes?: string
}

interface ParentChildRelationship {
  id: string
  type: "parent-child"
  childId: string
  parentIds?: string[]
  unionId?: string
  biological?: "biological" | "adopted" | "foster" | "step" | "surrogate" | "unknown"
  pregnancyOutcome?: "live-birth" | "miscarriage" | "stillbirth" | "abortion"
}

type EmotionalBond =
  | "close"
  | "very-close"
  | "fused"
  | "distant"
  | "estranged"
  | "cutoff"
  | "hostile"
  | "conflict"
  | "fused-hostile"
  | "abuse"
  | "neglect"
  | "friendship"
  | "love"
  | "focused-on"

interface EmotionalRelationship {
  id: string
  type: "emotional"
  personIds: [string, string]
  bond: EmotionalBond
  direction?: "mutual" | "a-to-b" | "b-to-a"
  notes?: string
}

interface Layout {
  orientation?: "top-down" | "bottom-up"
  generationSpacing?: number
  siblingSpacing?: number
  positions?: { personId: string; x: number; y: number; generation?: number }[]
}

export type {
  Genogram,
  Sex,
  Person,
  Condition,
  NodeStyle,
  Relationship,
  UnionRelationship,
  ParentChildRelationship,
  EmotionalBond,
  EmotionalRelationship,
  Layout,
}
