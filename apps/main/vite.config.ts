import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [
    react({
      jsxImportSource: "@galacticcouncil/ui/jsx",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    tsconfigPaths(),
    TanStackRouterVite(),
  ],
})
