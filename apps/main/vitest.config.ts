import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Node by default; a rendered test opts in with `// @vitest-environment jsdom`.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
})
