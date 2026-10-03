import assert from "node:assert/strict"
const { default: playwright } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const browser = await playwright.chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
})
const page = await browser.newPage({ viewport: { width: 700, height: 1000 } })
const errors = []
page.on("pageerror", (error) => errors.push(String(error)))
try {
  await page.goto("http://127.0.0.1:4179", { waitUntil: "networkidle" })
  const input = page.getByLabel("Amount")
  const submit = page.locator("button[type=submit]")
  const update = async (value) =>
    page.evaluate((value) => window.updateFixture(value), value)
  const isDisabled = async (expected) =>
    page.waitForFunction(
      (expected) =>
        document.querySelector("button[type=submit]").disabled === expected,
      expected,
      { timeout: 5000, polling: 50 },
    )
  await input.fill("0.5")
  await isDisabled(false)
  await submit.click({ force: true })
  assert.deepEqual(await page.evaluate(() => window.fixture.submitted), ["0.5"])
  console.log("PASS valid amount submits unchanged")
  await input.fill("0.1000000000000000001")
  await isDisabled(true)
  console.log("PASS amounts beyond token precision are rejected")
  await input.fill("0.001")
  await isDisabled(true)
  await input.fill("3")
  await isDisabled(true)
  await page
    .getByRole("button", { name: "MAX", exact: true })
    .click({ force: true })
  assert.equal(await input.inputValue(), "2")
  await isDisabled(false)
  console.log("PASS minimum, maximum and MAX enforce shared trade bounds")
  await page.evaluate(() =>
    window.updateFixture({
      admission: {
        minimum: 10n ** 16n,
        maximum: 1000000000000000001n,
        expired: false,
      },
    }),
  )
  await isDisabled(true)
  await page
    .getByRole("button", { name: "MAX", exact: true })
    .click({ force: true })
  assert.equal(await input.inputValue(), "1.000000000000000001")
  console.log(
    "PASS shrinking capacity revalidates entered amount and preserves exact MAX",
  )
  const stats = await page.evaluate(() => window.fixture.stats)
  for (const override of [
    { error: true },
    { stats: null },
    { rpcReady: false },
    { stats: { ...stats, underfunded: true } },
    { stats: { ...stats, tvlCap: 0 } },
  ]) {
    await update(override)
    await isDisabled(true)
    await update({ error: false, stats, rpcReady: true })
  }
  console.log(
    "PASS missing/failed reads, disconnected RPC, underfunding and zero TVL cap disable deposits",
  )
  await page.evaluate(() =>
    window.updateFixture({
      admission: { minimum: 10n ** 16n, maximum: 0n, expired: false },
    }),
  )
  await isDisabled(true)
  await page.evaluate(() =>
    window.updateFixture({
      admission: { minimum: 10n ** 16n, maximum: 10n ** 18n, expired: true },
    }),
  )
  await isDisabled(true)
  console.log("PASS exhausted and expired admission remain closed")
  assert.deepEqual(errors, [])
  console.log("PASS no browser runtime errors")
} catch (error) {
  console.log(await page.locator("body").innerText())
  throw error
} finally {
  await browser.close()
}
