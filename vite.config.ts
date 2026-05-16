import { defineConfig, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import basicSsl from "@vitejs/plugin-basic-ssl"
import fs from "fs/promises"
import { resolve } from "node:path"
import { exec } from "child_process"
import Unfonts from "unplugin-fonts/vite"

import * as child from "child_process"

type Metadata = {
  title?: string
  description?: string
  image?: string
}

type MetadataMap = Record<string, Metadata>

export const SEO_METADATA = {
  index: {
    title: "Hydration - An Ocean of Liquidity",
    description:
      "Hydration is a next-gen DeFi protocol which is designed to bring an ocean of liquidity to Polkadot. Our tool for the job the Hydration - an innovative Automated Market Maker (AMM) which unlocks unparalleled efficiencies by combining all assets in a single trading pool.",
    image: "https://hydration.net/twitter-image.png",
  },
  referrals: {
    image: "https://hydration.net/opengraph-image-ref.jpg",
  },
} satisfies MetadataMap

const commitHash = child
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim()

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    define: {
      "import.meta.env.VITE_COMMIT_HASH": JSON.stringify(commitHash),
    },
    build: {
      target: "esnext",
      outDir: "build",
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
        // shared-models bundles its `configured-json-rpc-provider.js` which
        // does `class ConfiguredJsonRpcProvider extends ethers_1.JsonRpcProvider`.
        // Its package.json lists ethers ^6 as a peer dep but the hoisted
        // top-level `ethers` is v5.7 (used by the rest of the app), so
        // require("ethers") inside shared-models resolves to v5 and
        // `JsonRpcProvider` is undefined. We redirect it to `ethers6` (an
        // npm-alias for `ethers@6.14.3` set up in package.json), but only
        // when the importer is inside shared-models so other ethers v5
        // consumers stay on v5.
        plugins: [
          {
            name: "redirect-shared-models-ethers6",
            setup(build) {
              build.onResolve({ filter: /^ethers$/ }, (args) => {
                if (
                  args.importer.includes(
                    "/@railgun-community/shared-models/",
                  )
                ) {
                  return build.resolve("ethers6", {
                    kind: "import-statement",
                    resolveDir: args.resolveDir,
                  })
                }
                return undefined
              })
            },
          },
        ],
      },
      // Skip pre-bundling for the RAILGUN engine + its wasm-bearing deps.
      // Vite's CJS-to-ESM scan rewrites their `new URL("./*.wasm", ...)`
      // patterns incorrectly, so the wasm assets resolve to index.html and
      // fail with "WebAssembly.instantiate(): expected magic word 00 61 73 6d".
      // Leaving them un-bundled lets the engine load its wasm at runtime
      // directly from node_modules.
      // Only the two wasm packages must be excluded — Vite's pre-bundler
      // breaks their `new URL("./*.wasm", import.meta.url)` patterns. The
      // engine itself MUST be pre-bundled (it ships CJS, named imports
      // depend on Vite's interop).
      exclude: [
        "@railgun-community/poseidon-hash-wasm",
        "@railgun-community/curve25519-scalarmult-wasm",
      ],
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
    resolve: {
      alias: {
        // Engine package's exports map blocks subpaths; alias straight to the
        // internal file so the privacy module can grab PollingJsonRpcProvider.
        "railgun-engine-polling-provider": resolve(
          process.cwd(),
          "node_modules/@railgun-community/engine/dist/provider/polling-json-rpc-provider.js",
        ),
        // Phase 5d: vendored waku-broadcaster-client lives outside `src/`,
        // so it's not picked up by `tsconfigPaths()`'s default rootDirs.
        // Map the package name straight to its src entrypoint here too;
        // Vite picks the first matching alias.
        "@galacticcouncil/railgun-waku-broadcaster-client": resolve(
          process.cwd(),
          "packages/railgun-waku-broadcaster-client/src/index.ts",
        ),
        ...(command === "build"
          ? {
              "@polkadot-api/descriptors":
                "./.papi/descriptors/dist/index.mjs",
            }
          : {}),
      },
    },
    plugins: [
      // Polyfill Node builtins (buffer, util, stream, process, crypto, …) that
      // the RAILGUN engine pulls in transitively via bn.js, readable-stream,
      // browserify-aes, hash-base, etc.
      nodePolyfills({
        protocolImports: true,
        globals: { Buffer: true, global: true, process: true },
      }),
      // Self-signed HTTPS so the LAN URL counts as a "secure context".
      // Without this `window.crypto.randomUUID` and `crypto.subtle` are
      // undefined on `http://192.168.x.x:5175/`, which the RAILGUN wallet
      // signing path needs. localhost would also work, but we want LAN access.
      basicSsl(),
      tsconfigPaths(),
      react({
        jsxImportSource: "@basilisk/jsx",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      wasm(),
      svgr(),
      Unfonts({
        custom: {
          display: "swap",
          prefetch: true,
          injectTo: "head",
          families: [
            {
              name: "Geist",
              local: "Geist",
              src: "./src/assets/fonts/Geist/Geist-Regular.ttf",
            },
            {
              name: "GeistMedium",
              local: "GeistMedium",
              src: "./src/assets/fonts/Geist/Geist-Medium.ttf",
            },
            {
              name: "GeistSemiBold",
              local: "GeistSemiBold",
              src: "./src/assets/fonts/Geist/Geist-SemiBold.ttf",
            },
            {
              name: "GeistMono",
              local: "GeistMono",
              src: "./src/assets/fonts/GeistMono/GeistMono-Regular.otf",
            },
            {
              name: "GeistMonoSemiBold",
              local: "GeistMonoSemiBold",
              src: "./src/assets/fonts/GeistMono/GeistMono-SemiBold.otf",
            },
            {
              name: "Gazpacho",
              local: "Gazpacho",
              src: "./src/assets/fonts/Gazpacho/Gazpacho.woff2",
            },
          ],
        },
      }),
      transformIndexHtml(),
    ],
  }
})

function transformIndexHtml(
  options: {
    templatePath?: string
    indexFileName?: string
  } = {},
): Plugin {
  const { templatePath, indexFileName } = Object.assign(
    {
      indexFileName: "index.html",
      templatePath: "./index.template.html",
    },
    options,
  )

  return {
    name: "transform-index-html",
    apply: "build",
    config: async () => {
      const template = await fs.readFile(resolve(__dirname, templatePath))
      const { index, ...rest } = SEO_METADATA

      const processFiles = Object.keys(SEO_METADATA).map(async (path) => {
        const pageMeta = rest[path]
        const metadata = {
          ...index,
          ...pageMeta,
        }

        const pagePath = resolve(
          __dirname,
          `pages/${path.replace("index", "")}`,
        )
        const filePath = `${pagePath}/${indexFileName}`
        await fs.mkdir(pagePath, { recursive: true })

        return fs.writeFile(
          filePath,
          template
            .toString()
            .replace(/<%=\s*(\w+)\s*%>/gi, (_match, p1) => metadata[p1] || ""),
        )
      })

      await Promise.all(processFiles)
      return {
        build: {
          rollupOptions: {
            input: Object.fromEntries(
              Object.entries(SEO_METADATA).map(([path]) => {
                const entries = [
                  path,
                  resolve(
                    __dirname,
                    path === "index"
                      ? `pages/${indexFileName}`
                      : `pages/${path}/${indexFileName}`,
                  ),
                ]
                return entries
              }),
            ),
          },
        },
      }
    },
    closeBundle: () => {
      exec(`mv -f ./build/pages/* ./build && rm -rf ./pages`)
    },
  }
}
