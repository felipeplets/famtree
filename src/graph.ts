// GenogramGraph: an indexed, query-friendly view over a raw genogram document.
// Owns the family-structure domain logic (who are the parents, children, unions)
// and the generation (vertical rank) computation. Rendering lives elsewhere.

import type {
  Genogram, Person, Relationship, UnionRelationship,
  ParentChildRelationship, EmotionalRelationship,
} from "./genogram";

const isUnion = (r: Relationship): r is UnionRelationship => r.type === "union";
const isParentChild = (r: Relationship): r is ParentChildRelationship =>
  r.type === "parent-child";
const isEmotional = (r: Relationship): r is EmotionalRelationship =>
  r.type === "emotional";

export class GenogramGraph {
  readonly people: Map<string, Person>;
  readonly unions: UnionRelationship[];
  readonly parentChild: ParentChildRelationship[];
  readonly emotions: EmotionalRelationship[];

  private readonly unionById: Map<string, UnionRelationship>;
  private readonly pcByChild: Map<string, ParentChildRelationship>;
  private readonly gen = new Map<string, number>();

  constructor(readonly doc: Genogram) {
    this.people = new Map(doc.people.map((p) => [p.id, p]));
    this.unions = doc.relationships.filter(isUnion);
    this.parentChild = doc.relationships.filter(isParentChild);
    this.emotions = doc.relationships.filter(isEmotional);
    this.unionById = new Map(this.unions.map((u) => [u.id, u]));
    this.pcByChild = new Map(this.parentChild.map((pc) => [pc.childId, pc]));
    this.computeGenerations();
  }

  get roster(): Person[] {
    return this.doc.people;
  }

  parentLinkOf(id: string): ParentChildRelationship | undefined {
    return this.pcByChild.get(id);
  }

  parentsOf(id: string): string[] {
    const pc = this.pcByChild.get(id);
    if (!pc) return [];
    if (pc.unionId) return this.unionById.get(pc.unionId)?.partnerIds ?? [];
    return pc.parentIds ?? [];
  }

  unionHeadedBy(id: string): UnionRelationship | undefined {
    return this.unions.find((u) => u.partnerIds.includes(id));
  }

  childrenOfUnion(uid: string): string[] {
    return this.parentChild.filter((pc) => pc.unionId === uid).map((pc) => pc.childId);
  }

  singleChildrenOf(id: string): string[] {
    return this.parentChild
      .filter((pc) => !pc.unionId && (pc.parentIds ?? []).includes(id))
      .map((pc) => pc.childId);
  }

  sortByBirth(ids: string[]): string[] {
    return [...ids].sort((a, b) => {
      const pa = this.people.get(a)!, pb = this.people.get(b)!;
      return (pa.birthOrder ?? 99) - (pb.birthOrder ?? 99) ||
        (pa.birthDate ?? "").localeCompare(pb.birthDate ?? "");
    });
  }

  generationOf(id: string): number {
    return this.gen.get(id) ?? 0;
  }

  // Assign each person a generation index, then align partners to the deeper
  // generation and push descendants below their parents until stable.
  private computeGenerations(): void {
    const visit = (id: string, seen = new Set<string>()): number => {
      if (this.gen.has(id)) return this.gen.get(id)!;
      if (seen.has(id)) return 0;
      seen.add(id);
      const ps = this.parentsOf(id);
      const val = ps.length ? Math.max(...ps.map((p) => visit(p, seen))) + 1 : 0;
      this.gen.set(id, val);
      return val;
    };
    for (const p of this.doc.people) visit(p.id);

    for (let pass = 0; pass < this.doc.people.length; pass++) {
      let changed = false;
      for (const u of this.unions) {
        const [a, b] = u.partnerIds;
        const m = Math.max(this.gen.get(a)!, this.gen.get(b)!);
        if (this.gen.get(a) !== m || this.gen.get(b) !== m) {
          this.gen.set(a, m); this.gen.set(b, m); changed = true;
        }
      }
      for (const pc of this.parentChild) {
        const parents = this.parentsOf(pc.childId);
        const pg = Math.max(0, ...parents.map((p) => this.gen.get(p)!));
        if (parents.length && this.gen.get(pc.childId)! <= pg) {
          this.gen.set(pc.childId, pg + 1); changed = true;
        }
      }
      if (!changed) break;
    }
  }
}
