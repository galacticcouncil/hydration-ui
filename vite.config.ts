import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import vitePluginSentry from "vite-plugin-sentry"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN && !!env.VITE_SENTRY_DSN

  return {
    build: {
      target: "esnext",
      outDir: "build",
      sourcemap: sentryEnabled,
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
      tsconfigPaths(),
      react({
        jsxImportSource: "@basilisk/jsx",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      wasm(),
      svgr(),
      vitePluginSentry({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        url: process.env.SENTRY_URL,
        project: process.env.SENTRY_PROJECT,
        org: process.env.SENTRY_ORG,
        deploy: { env: mode },
        setCommits: { auto: true },
        sourceMaps: {
          include: ["./build/assets"],
          ignore: ["node_modules"],
          urlPrefix: "~/assets",
        },
      }),
    ],
  }
})
