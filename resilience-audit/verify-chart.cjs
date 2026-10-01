const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { pathToFileURL } = require("node:url")
const { chromium } = require(
  process.env.AUDIT_PLAYWRIGHT_MODULE || "playwright",
)

const root = path.resolve(__dirname, "..")
const graphs = __dirname
const evidence = path.join(graphs, "evidence")
const data = JSON.parse(fs.readFileSync(path.join(graphs, "dependencies.json")))
const { outputDir } = require("./output.cjs")
const output = path.join(outputDir, "chart")
fs.mkdirSync(output, { recursive: true })

async function main() {
  const ids = new Set(data.dependencies.map((d) => d.id))
  assert.equal(ids.size, data.dependencies.length)
  const graphNodes = new Set([
    ...ids,
    ...data.startupConsumers.map((n) => n.id),
  ])
  for (const edge of data.startupEdges) {
    assert(graphNodes.has(edge.from), `Missing edge source ${edge.from}`)
    assert(graphNodes.has(edge.to), `Missing edge target ${edge.to}`)
  }
  for (const dep of data.dependencies) {
    assert(dep.evidence.length, `No source evidence for ${dep.id}`)
    for (const test of dep.testRefs)
      assert(
        fs.existsSync(path.join(evidence, test.file)),
        `Missing ${test.file}`,
      )
  }
  for (const item of data.browserResults) {
    const result = JSON.parse(fs.readFileSync(path.join(evidence, item.file)))
    assert(!result.harnessError, `Invalid browser result ${item.file}`)
    assert(fs.existsSync(path.join(evidence, item.screenshot)))
    assert(
      Object.values(result.websocketTraffic).some((ws) => ws.received > 0),
      `No Hydration responses ${item.file}`,
    )
  }
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.AUDIT_CHROMIUM_EXECUTABLE || undefined,
    args: ["--no-sandbox"],
  })
  const errors = [],
    remoteRequests = []
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
    })
    const page = await context.newPage()
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) remoteRequests.push(request.url())
    })
    await page.goto(pathToFileURL(path.join(graphs, "dependencies.html")).href)
    await page.locator("#detail-title").waitFor()
    assert.equal(
      await page.locator("#detail-title").textContent(),
      data.dependencies.find((d) => d.id === "asset-metadata-cdn").label,
    )
    const active = data.dependencies.filter(
      (d) => !["dormant", "build"].includes(d.activity),
    )
    assert.equal(await page.locator("#rows tr").count(), active.length)
    await page.screenshot({ path: path.join(output, "chart-desktop.png") })
    await page.locator("#search").fill("1Click")
    await page.locator('[data-id="oneclick-quote-build"]').click()
    assert.equal(
      await page.locator("#detail-title").textContent(),
      data.dependencies.find((d) => d.id === "oneclick-quote-build").label,
    )
    assert(
      (await page.locator("#detail").innerText()).includes("order deadline"),
    )
    assert(page.url().endsWith("#oneclick-quote-build"))
    await page.locator("#search").fill("unlikely-service-that-does-not-exist")
    assert.equal(await page.locator("#rows tr").count(), 0)
    assert(await page.locator("#empty").isVisible())
    await page.locator("#search").fill("")
    await page.locator("#impact").selectOption("dormant")
    assert.equal(
      await page.locator("#rows tr").count(),
      data.dependencies.filter((d) => d.impact === "dormant").length,
    )
    assert.equal(
      data.dependencies.find((d) => d.id === "basejumpscan").activity,
      "dormant",
    )
    assert.equal(
      data.dependencies.find((d) => d.id === "subscan-proxy-helper").activity,
      "dormant",
    )
    await page.locator("#impact").selectOption("all")
    await page.locator("#category").selectOption("Wallet services")
    assert.equal(
      await page.locator("#rows tr").count(),
      data.dependencies.filter((d) => d.category === "Wallet services").length,
    )
    await page.locator("#category").selectOption("all")
    // Every record must be selectable with its source section available.
    for (const dep of data.dependencies) {
      await page.locator(`[data-id="${dep.id}"]`).click()
      assert.equal(await page.locator("#detail-title").textContent(), dep.label)
      assert.equal(
        await page.locator(".evidence-list a").count(),
        dep.evidence.length,
      )
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(
      pathToFileURL(path.join(graphs, "dependencies.html")).href +
        "#oneclick-registry",
    )
    await page.locator("#detail-title").waitFor()
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto"
      window.scrollTo(0, 0)
    })
    const width = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }))
    assert(
      width.document <= width.viewport,
      `Mobile page overflow: ${JSON.stringify(width)}`,
    )
    await page.screenshot({ path: path.join(output, "chart-mobile.png") })
    await page
      .getByRole("link", { name: "Browse dependencies", exact: true })
      .click()
    assert(await page.locator("#search").isVisible())
    await page.locator("#search").fill("NEAR RPC")
    await page.locator('[data-id="rpc-near"]').click()
    assert.equal(
      await page.locator("#detail-title").textContent(),
      data.dependencies.find((d) => d.id === "rpc-near").label,
    )
    // Optional text and class values must remain text, even if the data changes.
    await page.evaluate(() => {
      window.__chartInjection = 0
      const dep = D.dependencies.find((d) => d.id === "asset-metadata-cdn")
      dep.label = '<img src=x onerror="window.__chartInjection=1">'
      dep.impact = 'broad" onclick="window.__chartInjection=2'
      renderDetail(dep)
      renderRows()
    })
    assert.equal(
      await page
        .locator("#detail img, #detail [onclick], #rows [onclick]")
        .count(),
      0,
    )
    assert((await page.locator("#detail-title").textContent()).includes("<img"))
    assert.equal(await page.evaluate(() => window.__chartInjection), 0)
    assert.equal(errors.length, 0, errors.join("\n"))
    assert.equal(
      remoteRequests.length,
      0,
      "Offline chart initiated remote requests",
    )
    const result = {
      dependencies: data.dependencies.length,
      active: active.length,
      packages: data.packageInventory.packages.length,
      browserEvidence: data.browserResults.length,
      everyDependencySelectable: true,
      filters: ["search", "empty", "impact", "category"],
      mobileViewport: "390x844",
      desktopViewport: "1440x1100",
      remoteRequests,
      pageErrors: errors,
      sourceAndEvidenceLinksExist: true,
      maliciousMarkupRemainsText: true,
    }
    fs.writeFileSync(
      path.join(output, "validation.json"),
      JSON.stringify(result, null, 2) + "\n",
    )
    console.log(JSON.stringify(result))
    await context.close()
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
