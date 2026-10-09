import assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  injectPublicTestWallet,
  PUBLIC_TEST_NAME,
  TEST_ORIGIN,
} from "./propeller-public-test-wallet.mjs"
const { default: pw } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const outputDir =
  process.env.OUTPUT_DIR ||
  (await mkdtemp(join(tmpdir(), "propeller-actions-")))
const browser = await pw.chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
})
const report = { checks: [] },
  width = Number(process.env.WIDTH || 1280),
  context = await browser.newContext({ viewport: { width, height: 1000 } }),
  wallet = await injectPublicTestWallet(context),
  page = await context.newPage(),
  errors = []
page.setDefaultTimeout(15000)
page.on("pageerror", (e) => errors.push(String(e)))
const log = (name) => {
  report.checks.push({ name, passed: true })
  console.log("PASS", name)
}
const ready = async () => {
  await page
    .getByText("Remaining capacity:", { exact: true })
    .waitFor({ timeout: 45000 })
  await page.waitForFunction(
    () => !document.body.innerText.includes("Loading vault"),
  )
}
const form = () => page.locator("form").first(),
  input = () => form().locator("input[inputmode=decimal]"),
  dialog = () =>
    page.locator('[role=dialog]:not(:has([aria-label="Close promote banner"]))')
const enabled = async (locator, wanted) => {
  const deadline = Date.now() + 10000
  while (Date.now() < deadline) {
    if ((await locator.isEnabled()) === wanted) return
    await page.waitForTimeout(100)
  }
  assert.equal(await locator.isEnabled(), wanted)
}
const close = async () => {
  const id = await dialog().last().getAttribute("id")
  await page.mouse.move(0, 0)
  await page.keyboard.press("Escape")
  await page.locator(`[id="${id}"]`).waitFor({ state: "hidden" })
}
try {
  await page.goto(`${TEST_ORIGIN}/strategies/juicer?asset=ETH`, {
    waitUntil: "domcontentloaded",
  })
  await ready()
  const promo = page.getByRole("button", {
    name: "Close promote banner",
    exact: true,
  })
  if (await promo.isVisible()) await promo.click()
  await page
    .getByRole("button", { name: "Connect Wallet", exact: true })
    .first()
    .click()
  await page.getByText("Polkadot.js", { exact: true }).click()
  await page.getByText(PUBLIC_TEST_NAME, { exact: true }).click()
  await page
    .getByRole("button", { name: "Withdraw ETH", exact: true })
    .waitFor({ timeout: 45000 })
  await input().fill("0.001")
  await enabled(form().locator("button[type=submit]"), true)
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth <= 1,
    ),
    "Connected account must not overflow the page",
  )
  log("connect and read both live positions without page overflow")
  if (width === 1280) {
    for (const resizedWidth of [320, 390, 768, 1024, 1100, 1440, width]) {
      await page.setViewportSize({ width: resizedWidth, height: 1000 })
      await page.waitForFunction(
        () => document.documentElement.scrollWidth - innerWidth <= 1,
      )
    }
    log("connected layout remains within the viewport after resizing")
  }
  for (const value of [
    "",
    "0",
    "-1",
    "abc",
    "1e-3",
    "0x10",
    "Infinity",
    "1.0000000000000000001",
    "0.1000000000000000001",
  ]) {
    await input().fill("")
    if (value) await input().fill(value)
    await enabled(form().locator("button[type=submit]"), false)
    assert.equal(
      await page
        .getByRole("button", { name: "Copy error", exact: true })
        .count(),
      0,
    )
  }
  for (const value of ["0.000000000000000001", ".001", "0,001", "0.001"]) {
    await input().fill("")
    await input().fill(value)
    await enabled(form().locator("button[type=submit]"), true)
  }
  await input().fill("")
  await input().pressSequentially(".001")
  assert.equal(await input().inputValue(), "0.001")
  await enabled(form().locator("button[type=submit]"), true)
  log("pasted and typed amount validation without crashes")
  await form().getByRole("button", { name: /^max$/i }).click()
  assert.ok(Number((await input().inputValue()).replaceAll(" ", "")) > 0)
  await enabled(form().locator("button[type=submit]"), true)
  log("Max uses the spendable balance")
  await form().locator("button").filter({ hasText: /^ETH$/ }).click()
  await dialog().waitFor()
  await dialog().getByText("tBTC", { exact: true }).click()
  await dialog().waitFor({ state: "hidden" })
  assert.equal(await input().inputValue(), "")
  await form()
    .locator("button")
    .filter({ hasText: /^tBTC$/ })
    .waitFor()
  log("asset selection clears the previous amount")
  for (const symbol of ["ETH", "tBTC"]) {
    const name = symbol === "ETH" ? "Ethereum" : "Threshold BTC"
    const card = page
      .getByText(name, { exact: true })
      .locator("xpath=ancestor::*[.//button[normalize-space(.)='Deposit']][1]")
    await card.getByRole("button", { name: "Deposit", exact: true }).click()
    await dialog().waitFor()
    assert.match(await dialog().innerText(), new RegExp(`Deposit ${symbol}`))
    assert.ok(
      await dialog()
        .locator("button")
        .filter({ hasText: new RegExp(`^${symbol}$`) })
        .isDisabled(),
    )
    await close()
    await page
      .getByRole("button", { name: `Withdraw ${symbol}`, exact: true })
      .click()
    await dialog()
      .locator("input[inputmode=decimal]")
      .fill(symbol === "ETH" ? ".0001" : ".000001")
    await enabled(
      dialog().getByRole("button", { name: "Request withdrawal", exact: true }),
      false,
    )
    await dialog().getByRole("checkbox").check()
    await enabled(
      dialog().getByRole("button", { name: "Request withdrawal", exact: true }),
      true,
    )
    assert.match(await dialog().innerText(), /\$[0-9]/)
    await dialog().getByRole("button", { name: /^max$/i }).click()
    assert.ok(
      Number(
        (
          await dialog().locator("input[inputmode=decimal]").inputValue()
        ).replaceAll(" ", ""),
      ) > 0,
    )
    await close()
  }
  log(
    "both deposit dialogs lock the asset; both withdrawal forms require acknowledgement",
  )
  await page.screenshot({
    path: `${outputDir}/actions-juicer-${width}.png`,
    fullPage: true,
  })
  await page.goto(`${TEST_ORIGIN}/portfolio/?category=strategies`, {
    waitUntil: "domcontentloaded",
  })
  await page
    .getByRole("row")
    .filter({ has: page.getByText("tBTC", { exact: true }) })
    .waitFor({ timeout: 45000 })
  const search = page.getByPlaceholder("Search assets...")
  await search.fill("no-match-4127")
  await page
    .getByText(/No results/i)
    .first()
    .waitFor()
  await search.fill("tbtc")
  await page.waitForTimeout(500)
  assert.equal(
    await page
      .getByRole("row")
      .filter({ has: page.getByText("ETH", { exact: true }) })
      .count(),
    0,
  )
  await search.fill("")
  await page
    .getByRole("row")
    .filter({ has: page.getByText("ETH", { exact: true }) })
    .waitFor()
  log("portfolio search by symbol and no-results recovery")
  for (const symbol of ["ETH", "tBTC"]) {
    const row = page
      .getByRole("row")
      .filter({ has: page.getByText(symbol, { exact: true }) })
    if (width < 768) {
      await row.getByRole("button", { name: "Details", exact: true }).click()
      await dialog().getByRole("button", { name: "Send", exact: true }).click()
    } else await row.getByRole("button", { name: "Send", exact: true }).click()
    assert.equal(
      await dialog().locator("input[inputmode=decimal]").inputValue(),
      "",
    )
    await dialog().getByRole("button", { name: /^max$/i }).click()
    await dialog()
      .getByPlaceholder("Paste address here...")
      .fill("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    assert.ok(
      await dialog()
        .getByRole("button", { name: "Confirm", exact: true })
        .isDisabled(),
    )
    assert.match(await dialog().innerText(), /Preview only/)
    await dialog()
      .getByRole("button", { name: /my contacts/i })
      .click()
    await dialog().getByText(PUBLIC_TEST_NAME, { exact: true }).click()
    assert.ok(
      (await dialog().getByPlaceholder("Paste address here...").inputValue())
        .length > 20,
    )
    await close()
    if (await dialog().count()) await close()
  }
  log(
    "Send preview, Max, recipient and contacts remain non-submitting; new position resets input",
  )
  await page.screenshot({
    path: `${outputDir}/actions-portfolio-${width}.png`,
    fullPage: true,
  })
  const tbtc = page
    .getByRole("row")
    .filter({ has: page.getByText("tBTC", { exact: true }) })
  if (width < 768) {
    await tbtc.getByRole("button", { name: "Details", exact: true }).click()
    await dialog().getByRole("link", { name: "Manage", exact: true }).click()
  } else await tbtc.getByRole("link", { name: "Manage", exact: true }).click()
  await ready()
  assert.ok(page.url().includes("asset=tBTC"))
  await form()
    .locator("button")
    .filter({ hasText: /^tBTC$/ })
    .waitFor()
  await page.reload({ waitUntil: "domcontentloaded" })
  await ready()
  await form()
    .locator("button")
    .filter({ hasText: /^tBTC$/ })
    .waitFor()
  log("Manage opens the correct asset and reload restores the wallet")
  await page
    .getByRole("button", { name: new RegExp(PUBLIC_TEST_NAME) })
    .first()
    .click()
  await page.getByRole("button", { name: "Log out", exact: true }).click()
  await page
    .getByRole("button", { name: "Connect Wallet", exact: true })
    .first()
    .waitFor()
  assert.equal(
    await page
      .getByRole("button", { name: "Withdraw ETH", exact: true })
      .count(),
    0,
  )
  log("logout clears private positions and withdraw actions")
  assert.equal(wallet.requests.length, 0)
  assert.deepEqual(errors, [])
  log("no signing requests or runtime errors")
  report.passed = true
} catch (e) {
  report.passed = false
  report.error = String(e)
  report.body = await page.locator("body").innerText()
  await page.screenshot({
    path: `${outputDir}/actions-failure-${width}.png`,
    fullPage: true,
  })
  console.error(report.error, report.body)
  process.exitCode = 1
} finally {
  report.width = width
  report.errors = errors
  await writeFile(
    process.env.REPORT_PATH || `${outputDir}/actions-${width}.json`,
    JSON.stringify(report, null, 2),
  )
  await wallet.dispose()
  await browser.close()
}
