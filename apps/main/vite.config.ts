/* eslint-disable no-restricted-imports */
import fs from "node:fs"
import { resolve } from "node:path"

import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, transformWithEsbuild } from "vite"
import { createHtmlPlugin } from "vite-plugin-html"
import svgr from "vite-plugin-svgr"
import wasm from "vite-plugin-wasm"
import tsconfigPaths from "vite-tsconfig-paths"

import { SEO_CONFIG } from "./src/config/seo"

const headInlineScript = await transformWithEsbuild(
  fs.readFileSync("./src/utils/head.js", "utf-8"),
  "head.js",
  { minify: true },
)

const headCriticalCss = await transformWithEsbuild(
  fs.readFileSync("./src/styles/critical.css", "utf-8"),
  "critical.css",
  { minify: true },
)

const loaderHtml = fs.readFileSync(
  "./src/components/Loader/loader.html",
  "utf-8",
)

export default defineConfig({
  build: {
    target: "es2022",
    outDir: "build",
    //sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: "chunk-[hash].js",
        manualChunks: (id) => {
          if (id.includes("/assets/icons")) {
            return "icons"
          }
        },
        experimentalMinChunkSize: 100_000,
      },
    },
  },
  resolve: {
    alias: {
      "@polkadot-api/descriptors": resolve(
        __dirname,
        "../../.papi/descriptors/dist/index.mjs",
      ),
    },
  },
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
    }),
    react({
      jsxImportSource: "@galacticcouncil/ui/jsx",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    wasm(),
    svgr({
      svgrOptions: {
        svgo: true,
      },
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        tags: [
          {
            injectTo: "head-prepend",
            tag: "script",
            children: headInlineScript.code,
          },
          {
            injectTo: "head-prepend",
            tag: "style",
            children: headCriticalCss.code,
          },
          {
            injectTo: "body-prepend",
            tag: "div",
            children: loaderHtml,
          },
          ...SEO_CONFIG,
        ],
      },
    }),
    tsconfigPaths(),
  ],
})
