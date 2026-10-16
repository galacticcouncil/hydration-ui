import assert from "node:assert/strict"
import { PROPELLER_VAULTS } from "../src/modules/strategies/propeller/config/vaults.ts"

const requireReady = process.argv.includes("--require-ready")
const verifyDeployment =
  requireReady || process.argv.includes("--verify-deployment")
const origin = process.env.UI_URL || "http://127.0.0.1:4178"
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
    await page.goto(new URL("/strategies/juicer", origin).href, {
      waitUntil: "domcontentloaded",
    })
    await page.waitForFunction(
      () => document.body.textContent.includes("Est. APR"),
      undefined,
      { timeout: 45_000, polling: 100 },
    )
    let text = await page.locator("body").innerText()
    assert.ok(text.includes("Est. APR"))
    assert.ok(text.includes("Lark 0 test deployment"))
    assert.ok(
      !/<0\s+tBTC\./.test(text),
      "Small tBTC amounts must retain token precision and symbol order",
    )
    assert.ok(text.includes("Depositing does not make a swap"))
    assert.ok(
      text.includes(
        "Funded earnings stay invested and are included in your balance",
      ),
    )
    assert.ok(text.includes("There is nothing to claim"))
    assert.ok(text.includes("Awaiting deployment"))
    const disclosure = async (label, expected) => {
      await page
        .getByText(label, { exact: true })
        .first()
        .locator("..")
        .getByRole("button")
        .click()
      const content =
        width < 768
          ? page.getByRole("dialog", { name: "Tooltip", exact: true })
          : page.getByRole("tooltip")
      await content.waitFor({ state: "visible" })
      const explanation = await content.innerText()
      for (const line of expected) assert.ok(explanation.includes(line), line)
      await page.mouse.move(0, 0)
      await page.keyboard.press("Escape")
      await content.waitFor({ state: "hidden" })
    }
    await disclosure("Gradual", ["your deposit transaction makes no swap"])
    await disclosure("Awaiting deployment", [
      "pooled within each vault",
      "not a personal queue or a completion estimate",
    ])
    await disclosure("Est. APR", ["unconverted yield is not funded crypto"])
    if (requireReady) {
      await page.waitForFunction(
        () => {
          const text = document.body.textContent || ""
          const deposits = [...document.querySelectorAll("button")].filter(
            (button) => button.textContent.trim() === "Deposit",
          )
          return (
            !/Deposits unavailable|Deposits paused|Vault at capacity|Paused|Full/.test(
              text,
            ) &&
            deposits.length >= 2 &&
            deposits.every((button) => !button.disabled)
          )
        },
        undefined,
        { timeout: 45_000 },
      )
    }
    text = await page.locator("body").innerText()
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
          (url) => new URL(url).hostname === "0.lark.hydration.cloud",
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
        ...(requireReady ? { depositsReady: true } : {}),
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
