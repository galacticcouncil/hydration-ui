import assert from "node:assert/strict"
import { PROPELLER_VAULTS } from "../src/modules/strategies/propeller/config/vaults.ts"

const verifyDeployment = process.argv.includes("--verify-deployment")
const expectedVaults = PROPELLER_VAULTS.map(({ vaultAddress }) =>
  vaultAddress.toLowerCase(),
)
const { default: playwright } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const browser = await playwright.chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
})
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } })
    const errors = []
    const rpcEndpoints = new Set()
    const readTargets = new Set()
    page.on("websocket", (socket) => {
      rpcEndpoints.add(socket.url())
      socket.on("framesent", ({ payload }) => {
        try {
          const message = JSON.parse(String(payload))
          for (const call of Array.isArray(message) ? message : [message]) {
            if (call.method === "eth_call" && call.params?.[0]?.to)
              readTargets.add(call.params[0].to.toLowerCase())
          }
        } catch {
          /* Non-JSON websocket frames are unrelated to EVM reads. */
        }
      })
    })
    page.on("pageerror", (error) => errors.push(String(error)))
    await page.goto("http://127.0.0.1:4178/strategies/juicer", {
      waitUntil: "domcontentloaded",
    })
    await page.waitForFunction(
      () => document.body.textContent.includes("Est. APR"),
      undefined,
      { timeout: 45_000, polling: 100 },
    )
    const text = await page.locator("body").innerText()
    assert.ok(text.includes("Est. APR"))
    assert.ok(text.includes("Lark-4 test deployment"))
    assert.ok(
      !/<0\s+tBTC\./.test(text),
      "Small tBTC amounts must retain token precision and symbol order",
    )
    assert.ok(text.includes("your deposit transaction makes no swap"))
    assert.ok(text.includes("Awaiting deployment"))
    assert.ok(text.includes("pooled within each vault"))
    assert.ok(text.includes("not a personal queue or a completion estimate"))
    assert.ok(text.includes("unconverted yield is not funded crypto"))
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    assert.ok(horizontalOverflow <= 1, `Page overflows at ${width}px`)
    if (verifyDeployment) {
      const deadline = Date.now() + 15000
      while (
        !expectedVaults.every((address) => readTargets.has(address)) &&
        Date.now() < deadline
      )
        await page.waitForTimeout(100)
      assert.ok(
        expectedVaults.every((address) => readTargets.has(address)),
        "Browser must read both configured vaults",
      )
      assert.ok(
        [...rpcEndpoints].some(
          (url) => new URL(url).hostname === "node4.lark.hydration.cloud",
        ),
        "Browser must connect to selected Lark RPC",
      )
    }
    assert.deepEqual(errors, [])
    console.log(
      JSON.stringify({
        width,
        title: await page.title(),
        errors,
        unavailable: text.includes("Deposits unavailable"),
        fundedDepositExplanation: true,
        pooledDeploymentExplanation: true,
        rateDisclosure: true,
        nativeAmountFormatting: true,
        horizontalOverflow,
        ...(verifyDeployment
          ? { rpcEndpoints: [...rpcEndpoints], readVaults: expectedVaults }
          : {}),
      }),
    )
    await page.close()
  }
} finally {
  await browser.close()
}
