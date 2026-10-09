import assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  injectPublicTestWallet,
  PUBLIC_TEST_NAME,
  TEST_ORIGIN,
} from "./propeller-public-test-wallet.mjs"

const { default: playwright } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const outputDir =
  process.env.OUTPUT_DIR ||
  (await mkdtemp(join(tmpdir(), "propeller-offline-")))
const browser = await playwright.chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
})
const context = await browser.newContext()
const wallet = await injectPublicTestWallet(context)
const page = await context.newPage()
const sockets = []
const errors = []
const report = { checks: [] }
let blocked = false
page.on("pageerror", (error) => errors.push(String(error)))

function disconnect() {
  blocked = true
  for (const socket of sockets.splice(0))
    socket.close({ code: 1001, reason: "isolated connectivity test" })
}

async function enabled(locator, expected) {
  const deadline = Date.now() + 45000
  while (Date.now() < deadline) {
    if ((await locator.isEnabled()) === expected) return
    await page.waitForTimeout(100)
  }
  assert.equal(await locator.isEnabled(), expected)
}

function passed(check) {
  report.checks.push(check)
  console.log("PASS", check)
}

try {
  await context.routeWebSocket(
    /wss:\/\/0\.lark\.hydration\.cloud/,
    (socket) => {
      if (blocked) {
        socket.close({ code: 1001, reason: "isolated connectivity test" })
        return
      }
      sockets.push(socket)
      socket.connectToServer()
    },
  )
  await page.goto(`${TEST_ORIGIN}/strategies/juicer`, {
    waitUntil: "domcontentloaded",
  })
  await page
    .getByText("Remaining capacity:", { exact: true })
    .waitFor({ timeout: 45000 })
  await page
    .getByRole("button", { name: "Connect Wallet", exact: true })
    .first()
    .click()
  await page.getByText("Polkadot.js", { exact: true }).click()
  await page.getByText(PUBLIC_TEST_NAME, { exact: true }).click()
  const form = page.locator("form").first()
  const deposit = form.locator("button[type=submit]")
  await form.locator("input[inputmode=decimal]").fill(".001")
  await enabled(deposit, true)
  assert.ok(sockets.length > 0)
  disconnect()
  await enabled(deposit, false)
  passed("lost RPC disables deposit")
  blocked = false
  await enabled(deposit, true)
  passed("automatic reconnect restores deposit readiness")
  await deposit.click()
  const sign = page.getByRole("button", {
    name: "Sign Transaction",
    exact: true,
  })
  await sign.waitFor()
  await enabled(sign, true)
  disconnect()
  await enabled(sign, false)
  passed("lost RPC disables signing in an open review")
  blocked = false
  await enabled(sign, true)
  passed("automatic reconnect restores transaction review")
  await page.keyboard.press("Escape")
  await sign.waitFor({ state: "hidden" })
  await page.reload({ waitUntil: "domcontentloaded" })
  await page
    .getByText("Remaining capacity:", { exact: true })
    .waitFor({ timeout: 45000 })
  await form.locator("input[inputmode=decimal]").fill(".001")
  await enabled(deposit, true)
  passed("reload preserves the connected account and restores readiness")
  assert.equal(wallet.requests.length, 0)
  assert.deepEqual(errors, [])
  report.passed = true
} catch (error) {
  report.passed = false
  report.error = String(error)
  report.body = await page.locator("body").innerText()
  console.error(report.error, report.body.slice(-1700))
  process.exitCode = 1
} finally {
  report.errors = errors
  report.signatures = wallet.requests.length
  await writeFile(
    join(outputDir, "offline-check.json"),
    JSON.stringify(report, null, 2),
  )
  await wallet.dispose()
  await browser.close()
}
