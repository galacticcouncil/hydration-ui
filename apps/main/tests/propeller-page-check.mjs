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
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } })
    const errors = []
    page.on("pageerror", (error) => errors.push(String(error)))
    await page.goto("http://127.0.0.1:4178/strategies/propeller", {
      waitUntil: "domcontentloaded",
    })
    await page.waitForFunction(
      () => document.body.textContent.includes("Indicative annual carry"),
      undefined,
      { timeout: 45_000, polling: 100 },
    )
    const text = await page.locator("body").innerText()
    assert.ok(text.includes("Est. APR before swaps"))
    assert.ok(text.includes("Deposits use a fresh swap quote"))
    assert.deepEqual(errors, [])
    console.log(
      JSON.stringify({
        width,
        title: await page.title(),
        errors,
        unavailable: text.includes("Deposits unavailable"),
        quoteExplanation: true,
        rateDisclosure: true,
      }),
    )
    await page.close()
  }
} finally {
  await browser.close()
}
