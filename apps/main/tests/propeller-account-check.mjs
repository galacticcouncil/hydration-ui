import assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  injectPublicTestWallet,
  PUBLIC_TEST_NAME,
} from "./propeller-public-test-wallet.mjs"
const outputDir =
  process.env.OUTPUT_DIR ||
  (await mkdtemp(join(tmpdir(), "propeller-accounts-")))
const { default: playwright } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const { chromium } = playwright

const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
  }),
  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  }),
  wallet = await injectPublicTestWallet(context),
  page = await context.newPage(),
  checks = [],
  errors = []
page.setDefaultTimeout(15000)
page.on("pageerror", (e) => errors.push(String(e)))
const log = (name) => {
  console.log("PASS", name)
  checks.push(name)
}
try {
  const empty = wallet.api
    .createType("AccountId", "0x" + "42".repeat(32))
    .toString()
  await page.goto("http://127.0.0.1:4178/strategies/juicer", {
    waitUntil: "domcontentloaded",
  })
  await page
    .getByText("Remaining capacity:", { exact: true })
    .waitFor({ timeout: 45000 })
  await page.evaluate((empty) => {
    const provider = window.injectedWeb3["polkadot-js"]
    const original = provider.enable
    provider.enable = async () => {
      const extension = await original()
      const get = extension.accounts.get
      extension.accounts.get = async () => [
        ...(await get()),
        {
          address: empty,
          name: "PUBLIC TEST — empty account",
          type: "sr25519",
        },
      ]
      extension.accounts.subscribe = (callback) => {
        extension.accounts.get().then(callback)
        return () => {}
      }
      return extension
    }
  }, empty)
  await page
    .getByRole("button", { name: "Connect Wallet", exact: true })
    .first()
    .click()
  await page.getByText("Polkadot.js", { exact: true }).click()
  await page.getByText(PUBLIC_TEST_NAME, { exact: true }).click()
  await page
    .getByRole("button", { name: "Withdraw ETH", exact: true })
    .waitFor({ timeout: 45000 })
  const form = page.locator("form").first()
  await form.locator("input[inputmode=decimal]").fill("0.001")
  await form.locator("button[type=submit]").click()
  await page
    .getByRole("button", { name: "Sign Transaction", exact: true })
    .waitFor({ timeout: 45000 })
  assert.equal(wallet.requests.length, 0)
  assert.ok(await form.locator("button[type=submit]").isDisabled())
  await page.screenshot({ path: join(outputDir, "transaction-review.png") })
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
  const cancel = page.getByRole("button", { name: /^cancel$/i })
  if (await cancel.isVisible()) await cancel.click()
  await page.waitForTimeout(300)
  assert.equal(wallet.requests.length, 0)
  log("transaction review disables repeat submission; closing it does not sign")
  await page
    .getByRole("button", { name: new RegExp(PUBLIC_TEST_NAME) })
    .first()
    .click()
  await page.getByText("PUBLIC TEST — empty account", { exact: true }).click()
  await page.waitForTimeout(2500)
  assert.equal(
    await page
      .getByRole("button", { name: "Withdraw ETH", exact: true })
      .count(),
    0,
  )
  assert.equal(
    await page
      .getByRole("button", { name: "Withdraw tBTC", exact: true })
      .count(),
    0,
  )
  const inp = page.locator("form").first().locator("input[inputmode=decimal]")
  await inp.fill(".001")
  assert.ok(
    await page
      .locator("form")
      .first()
      .locator("button[type=submit]")
      .isDisabled(),
  )
  log(
    "switching to an empty account removes previous positions and blocks unfunded deposits",
  )
  await page.goto("http://127.0.0.1:4178/portfolio/?category=strategies", {
    waitUntil: "domcontentloaded",
  })
  await page
    .getByText("No strategy positions", { exact: true })
    .waitFor({ timeout: 45000 })
  await page
    .getByRole("link", { name: "Explore strategies", exact: true })
    .click()
  await page.waitForURL("**/strategies")
  log("empty portfolio recovery link works")
  assert.deepEqual(errors, [])
  assert.equal(wallet.requests.length, 0)
  await writeFile(
    join(outputDir, "account-check.json"),
    JSON.stringify({ passed: true, checks, errors }, null, 2),
  )
} catch (e) {
  await writeFile(
    join(outputDir, "account-check.json"),
    JSON.stringify(
      {
        passed: false,
        checks,
        error: String(e),
        body: await page.locator("body").innerText(),
        errors,
      },
      null,
      2,
    ),
  )
  console.error(
    String(e),
    (await page.locator("body").innerText()).slice(-2400),
  )
  process.exitCode = 1
} finally {
  await wallet.dispose()
  await browser.close()
}
