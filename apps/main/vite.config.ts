/* eslint-disable no-restricted-imports */
import fs from "node:fs"

import babel from "@rolldown/plugin-babel"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { createHtmlPlugin } from "vite-plugin-html"
import svgr from "vite-plugin-svgr"
import wasm from "vite-plugin-wasm"

import { SEO_CONFIG } from "./src/config/seo"

const headInlineScript =  fs.readFileSync("./src/utils/head.js", "utf-8")

const loaderHtml = fs.readFileSync(
  "./src/components/Loader/loader.html",
  "utf-8",
)

const headCriticalCss = fs.readFileSync(
  "./src/styles/critical.css",
  "utf-8",
)

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: "es2022",
    outDir: "build",
    rolldownOptions: {
      output: {
        chunkFileNames: "chunk-[hash].js",
      },
    },
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
    }),
    react({
      jsxImportSource: "@galacticcouncil/ui/jsx",
    }),
    babel({
      include: /\.[jt]sx?$/,
      exclude: /node_modules/,
      plugins: ["@emotion/babel-plugin"],
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
            children: headInlineScript,
          },
          {
            injectTo: "head-prepend",
            tag: "style",
            children: headCriticalCss,
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
  ],
})
