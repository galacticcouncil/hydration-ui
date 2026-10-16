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
  await submit.click()
  assert.deepEqual(await page.evaluate(() => window.fixture.submitted), ["0.5"])
  console.log("PASS valid amount submits unchanged")
  await input.fill("0.1000000000000000001")
  await isDisabled(true)
  console.log("PASS amounts beyond token precision are rejected")
  await input.fill("0")
  await isDisabled(true)
  await input.fill("0.000000000000000001")
  await isDisabled(false)
  await submit.click()
  await input.fill("3")
  await isDisabled(false)
  await submit.click()
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
  await page.getByRole("button", { name: "MAX", exact: true }).click()
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
  await page.getByRole("button", { name: "MAX", exact: true }).click()
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
  await page.getByRole("button", { name: "MAX", exact: true }).click()
  assert.equal(await input.inputValue(), "1")
  await isDisabled(false)
  console.log("PASS wallet balance changes revalidate the amount and limit MAX")
  const body = await page.locator("body").innerText()
  assert.ok(body.includes("your deposit transaction makes no swap"))
  assert.ok(body.includes("supplies collateral"))
  assert.ok(!body.includes("fresh swap quote"))
  console.log(
    "PASS funded deposit and gradual deployment are explained without a swap quote",
  )
  await update({ depositError: true })
  await page.getByText(/The deposit could not complete/).waitFor()
  await page.evaluate(() => window.fixture.depositSucceeded())
  await page
    .getByText(/The deposit could not complete/)
    .waitFor({ state: "hidden" })
  console.log(
    "PASS a successful transaction retry clears the previous deposit error",
  )
  await update({ pending: true })
  await isDisabled(true)
  await update({ pending: false, mode: "withdraw" })
  await input.fill("0.5")
  await isDisabled(true)
  await page.getByRole("checkbox").check()
  await isDisabled(false)
  assert.equal(await page.locator("output").innerText(), "$1250.00")
  console.log(
    "PASS withdrawals require acknowledgement and show the collateral fiat value",
  )
  for (const value of [
    "",
    "0",
    "-1",
    "8.000000000000000001",
    "0.0000000000000000001",
  ]) {
    await input.fill(value)
    await isDisabled(true)
  }
  await input.fill(".5")
  await isDisabled(false)
  const stats = await page.evaluate(() => window.fixture.stats)
  for (const override of [
    { error: true },
    { rpcReady: false },
    { stats: null },
    { balances: null },
    { stats: { ...stats, paused: true } },
    { stats: { ...stats, minRedeem: 1 } },
    { pending: true },
  ]) {
    await update(override)
    await isDisabled(true)
    await update({
      error: false,
      rpcReady: true,
      stats,
      balances: { sharesExact: "8" },
      pending: false,
    })
    await isDisabled(false)
  }
  console.log(
    "PASS invalid amounts, minimum redemption, unavailable reads, paused vaults and pending transactions block withdrawals",
  )
  await page.getByRole("button", { name: "MAX", exact: true }).click()
  for (const sharesExact of ["8.000000000000000001", "7.999999999999999999"]) {
    await update({ balances: { sharesExact } })
    await page.waitForFunction(
      (value) => document.querySelector("input").value === value,
      sharesExact,
    )
    await isDisabled(false)
    await submit.click()
    assert.deepEqual(
      await page.evaluate(() => window.fixture.withdrawals.at(-1)),
      { shareAmount: sharesExact, isMax: true },
    )
  }
  await input.fill(".5")
  await update({ balances: { sharesExact: "9" } })
  await isDisabled(false)
  assert.equal(await input.inputValue(), ".5")
  await submit.click()
  assert.deepEqual(
    await page.evaluate(() => window.fixture.withdrawals.at(-1)),
    { shareAmount: ".5", isMax: false },
  )
  console.log(
    "PASS Max follows funded balance changes and manual edits restore partial withdrawals",
  )

  await page.evaluate(() => {
    const vault = {
      assetId: "34",
      shareSymbol: "jETH",
      vaultAddress: "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
    }
    const rows = Array.from({ length: 6 }, (_, index) => {
      const requestId = 6 - index
      return {
        id: `fixture:${requestId}`,
        requestId,
        vault,
        estEth: requestId,
        estUsd: requestId * 2500,
        eligibleAt: 0,
        collateralOwed: requestId,
        collateralSettled: requestId === 6 ? 1 : 0,
        surplusHollar: requestId === 5 ? 1 : 0,
        settledSoFar: 1,
        sourcePending: requestId === 2,
        state:
          requestId === 6
            ? "settled"
            : requestId === 4
              ? "partial"
              : requestId === 3
                ? "cooldown"
                : "claimed",
      }
    })
    window.updateFixture({ mode: "withdrawals", rows })
  })
  const claims = page.getByRole("button", {
    name: "Claim available payouts for ETH withdrawal",
    exact: true,
  })
  await claims.first().waitFor()
  assert.equal(await claims.count(), 2)
  assert.equal(await page.locator("article").count(), 5)
  assert.match(await page.locator("article").nth(2).innerText(), /Settling/)
  assert.match(await page.locator("article").nth(3).innerText(), /Cooldown/)
  assert.match(
    await page.locator("article").nth(4).innerText(),
    /recovery pending/i,
  )
  await claims.nth(1).click()
  assert.equal(
    await page.evaluate(() => window.fixture.claims.at(-1).requestId),
    5,
  )
  await update({ pendingClaims: ["fixture:6"] })
  await page.waitForFunction(
    () =>
      document.querySelector(
        'button[aria-label="Claim available payouts for ETH withdrawal"]',
      ).disabled,
  )
  assert.ok(await claims.first().isDisabled())
  assert.ok(await claims.nth(1).isEnabled())
  await page.getByRole("button", { name: "Next", exact: true }).click()
  assert.equal(await page.locator("article").count(), 1)
  assert.equal(await claims.count(), 0)
  await page.getByRole("button", { name: "Previous", exact: true }).click()
  assert.equal(await page.locator("article").count(), 5)
  console.log(
    "PASS claimable-first ordering, cooldown, partial settlement, late recovery, per-request pending guards and pagination",
  )

  await update({ mode: "review", preparing: true })
  const sign = page.getByRole("button", {
    name: "transaction.sign",
    exact: true,
  })
  await sign.waitFor()
  assert.ok(await sign.isDisabled())
  assert.deepEqual(await page.evaluate(() => window.fixture.signatures), [])
  await update({ preparing: false })
  await page.waitForFunction(() => !document.querySelector("button").disabled)
  await sign.click()
  assert.deepEqual(await page.evaluate(() => window.fixture.signatures), [
    "signed",
  ])
  await update({ preparing: true })
  await page.waitForFunction(() => document.querySelector("button").disabled)
  console.log(
    "PASS signing waits for fee and nonce preparation, including renewed preparation",
  )
  assert.deepEqual(errors, [])
  console.log("PASS no browser runtime errors")
} catch (error) {
  console.log(await page.locator("body").innerText())
  throw error
} finally {
  await browser.close()
}
