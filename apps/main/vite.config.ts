/* eslint-disable no-restricted-imports */
import fs from "node:fs"

import mdx from "@mdx-js/rollup"
import babel from "@rolldown/plugin-babel"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import remarkGfm from "remark-gfm"
import { defineConfig, loadEnv } from "vite"
import { createHtmlPlugin } from "vite-plugin-html"
import svgr from "vite-plugin-svgr"
import wasm from "vite-plugin-wasm"

import { PROVIDERS } from "./src/config/rpc"
import { SEO_CONFIG } from "./src/config/seo"

const headInlineScript = fs.readFileSync("./src/utils/head.js", "utf-8")

const rpcPingScript = fs.readFileSync("./src/utils/rpc-ping.js", "utf-8")

const loaderHtml = fs.readFileSync(
  "./src/components/Loader/loader.html",
  "utf-8",
)

const headCriticalCss = fs.readFileSync("./src/styles/critical.css", "utf-8")

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const rpcUrls = PROVIDERS.filter((provider) =>
    provider.env.includes(env.VITE_ENV ?? ""),
  ).map(({ url }) => url)
  const rpcPingInlineScript = rpcPingScript.replace(
    "__RPC_URLS__",
    JSON.stringify(rpcUrls),
  )

  return {
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
      ...(mode !== "production" ? [devtools()] : []),
      mdx({
        remarkPlugins: [remarkGfm],
        providerImportSource: "@mdx-js/react",
      }),
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
              tag: "script",
              children: rpcPingInlineScript,
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
  }
})
