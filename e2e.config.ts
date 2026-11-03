import type { E2EConfig } from "e2e"
import { web } from "@e2e-dev/web"
import { openrouter } from "@openrouter/ai-sdk-provider"
import { existsSync, readFileSync } from "node:fs"
import { parseEnv } from "node:util"

const E2E_MODEL_DEFAULT = "deepseek/deepseek-v4.1-flash"

if (existsSync(".env.local"))
  Object.assign(process.env, parseEnv(readFileSync(".env.local", "utf8")))

function seedStorage() {
  const seed = (key: string, value: unknown) => {
    if (localStorage.getItem(key) === null)
      localStorage.setItem(key, JSON.stringify(value))
  }
  const address = "135yiujiLFfogvTwbfr3yoqGK7zAu3f5SD5y1q8PMokYeSuc"
  seed("intents", { state: { enabled: true, hasSeenModal: true }, version: 1 })
  // The "trade-intents" hint shows once the intents modal was seen; retire it.
  seed("tutorial-hints", {
    state: { retiredIds: ["trade-intents"], progress: {} },
    version: 1,
  })
  seed("web3-connect", {
    state: {
      providers: [{ type: "external", status: "connected" }],
      recentProvider: "external",
      account: {
        publicKey:
          "0x5c4464cb3a63c97b065d8576533a3b6c14f9fc52c78bc3e4d1950f1ea853e706",
        address,
        rawAddress: address,
        name: "External Account",
        provider: "external",
      },
      mode: "default",
      meta: null,
    },
    version: 10,
  })
}

const appUrl = process.env.E2E_APP_URL

export default {
  tests: "tests/**/*.e2e.ts",
  trace: "retain-on-failure",
  timeout: 180_000,
  ...(process.env.OPENROUTER_API_KEY && {
    agents: {
      default: {
        model: openrouter(process.env.E2E_MODEL ?? E2E_MODEL_DEFAULT),
        system: 'You are a thorough QA agent. Verify every outcome.',
      },
    },
  }),
  targets: [
    {
      engine: web({
        viewport: { width: 1920, height: 1080 },
        initScripts: [seedStorage],
      }),
      app: appUrl
        ? { url: appUrl }
        : {
            // Mainnet app on a free port. CI serves the prebuilt bundle (the
            // workflow runs `yarn build` first): a cold dev server is too slow.
            url: "http://127.0.0.1:0",
            command: {
              executable: "yarn",
              args: [
                process.env.CI ? "preview" : "dev:production",
                "--port",
                "{port}",
                "--strictPort",
              ],
              cwd: "apps/main",
              startupTimeout: 30_000,
              log: ".e2e/logs/app.log",
            },
          },
    },
  ],
} satisfies E2EConfig
