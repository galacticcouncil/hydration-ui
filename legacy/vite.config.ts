import { defineConfig, splitVendorChunkPlugin, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import fs from "fs/promises"
import { resolve } from "node:path"
import { exec } from "child_process"
import Unfonts from "unplugin-fonts/vite"

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 5174,
    },
    build: {
      target: "esnext",
      outDir: "build",
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 200_000,
          manualChunks(id) {
            if (id.includes("src/assets")) {
              return "assets"
            }

            if (id.includes("@radix")) {
              return "@radix"
            }
          },
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
    plugins: [
      splitVendorChunkPlugin(),
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
