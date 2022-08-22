import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        presets: ["@babel/preset-typescript"],
        plugins: [
          "@babel/plugin-transform-typescript",
          [
            "babel-plugin-styled-components",
            {
              ssr: false,
              pure: true,
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
    svgr(),
  ],
})
