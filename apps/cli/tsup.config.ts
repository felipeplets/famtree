import { defineConfig } from "tsup"

export default defineConfig({
  entry: { cli: "src/cli.ts" },
  format: ["esm", "cjs"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "node18",
  external: [/^@famtree\//],
  // tsup preserves the `#!/usr/bin/env node` shebang on the CLI entry.
})
