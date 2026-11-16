import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Node by default; a rendered test opts in with `// @vitest-environment jsdom`.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
})
