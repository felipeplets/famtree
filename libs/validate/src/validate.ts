// Optional AJV-backed validation of a genogram document against @famtree/schema.
// ajv is an optional peer dependency so consumers that don't validate stay lean.

import { schema } from "@famtree/schema"

async function validate(doc: unknown): Promise<void> {
  let Ajv2020: typeof import("ajv/dist/2020").default
  try {
    // Explicit .js extension required for Node ESM resolution.
    Ajv2020 = (await import("ajv/dist/2020.js")).default
  } catch {
    throw new Error("Validation requires the optional 'ajv' dependency. Install it with: npm i ajv")
  }
  const ajv = new Ajv2020({ allErrors: true, strict: false, logger: false })
  const check = ajv.compile(schema)
  if (!check(doc)) {
    const details = (check.errors ?? []).map((e) => `  • ${e.instancePath || "(root)"} ${e.message}`).join("\n")
    throw new Error(`Document does not match famtree.schema.json:\n${details}`)
  }
}

export { validate }
