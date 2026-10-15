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
  await input.fill("0")
  await isDisabled(true)
  await input.fill("0.000000000000000001")
  await isDisabled(false)
  await submit.click({ force: true })
  await input.fill("3")
  await isDisabled(false)
  await submit.click({ force: true })
  assert.deepEqual(await page.evaluate(() => window.fixture.submitted), [
    "0.5",
    "0.000000000000000001",
    "3",
  ])
  console.log(
    "PASS positive deposits have no keeper trade minimum or slice maximum",
  )
  await input.fill("7.000000000000000001")
  await isDisabled(true)
  await page
    .getByRole("button", { name: "MAX", exact: true })
    .click({ force: true })
  assert.equal(await input.inputValue(), "7")
  await isDisabled(false)
  console.log("PASS maximum and MAX enforce collateral vault capacity")
  await page.evaluate(() =>
    window.updateFixture({
      capacity: {
        maximum: 1000000000000000001n,
        ready: true,
        paused: false,
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
  const capacity = await page.evaluate(() => window.fixture.capacity)
  for (const override of [
    { error: true },
    { capacity: null },
    { rpcReady: false },
    { capacity: { ...capacity, ready: false } },
    { capacity: { ...capacity, paused: true } },
    { capacity: { ...capacity, maximum: 0n } },
  ]) {
    await update(override)
    await isDisabled(true)
    await update({ error: false, capacity, rpcReady: true })
    await isDisabled(false)
  }
  console.log(
    "PASS missing/failed reads, disconnected RPC, unready or paused vaults and zero TVL capacity disable deposits",
  )
  await update({ balance: 10n ** 18n })
  await isDisabled(true)
  await page
    .getByRole("button", { name: "MAX", exact: true })
    .click({ force: true })
  assert.equal(await input.inputValue(), "1")
  await isDisabled(false)
  console.log("PASS wallet balance changes revalidate the amount and limit MAX")
  const body = await page.locator("body").innerText()
  assert.ok(body.includes("your deposit transaction makes no swap"))
  assert.ok(body.includes("mints funded vault shares"))
  assert.ok(!body.includes("fresh swap quote"))
  console.log(
    "PASS funded deposit and gradual deployment are explained without a swap quote",
  )
  assert.deepEqual(errors, [])
  console.log("PASS no browser runtime errors")
} catch (error) {
  console.log(await page.locator("body").innerText())
  throw error
} finally {
  await browser.close()
}
