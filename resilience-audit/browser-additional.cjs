const rpcEvidence = require("./rpc-evidence.cjs")
const fs = require("node:fs")
const path = require("node:path")
const { chromium } = require(
  process.env.AUDIT_PLAYWRIGHT_MODULE || "playwright",
)

const { outputDir } = require("./output.cjs")
const auditDir = path.join(
  outputDir,
  process.env.AUDIT_LABEL || "browser-additional",
)
fs.mkdirSync(auditDir, { recursive: true })
const uiRoot = path.dirname(__dirname)
const rpcSource = fs.readFileSync(
  path.join(uiRoot, "apps/main/src/config/rpc.ts"),
  "utf8",
)
const hydrationRpcs = new Set(
  [...rpcSource.matchAll(/wss:\/\/[^"\s]+/g)].map((m) => new URL(m[0]).href),
)
const hydrationHttpOrigins = new Set(
  [...hydrationRpcs].map(
    (url) => new URL(url.replace(/^wss:/, "https:")).origin,
  ),
)
const origin = process.env.AUDIT_ORIGIN || "http://127.0.0.1:4173"
const waitMs = Number(process.env.AUDIT_WAIT_MS || 35000)
const scenarios = (
  process.env.AUDIT_SCENARIOS ||
  "warm-all-external-hang,neckwork-malformed-stats"
).split(",")
const metadataUrl =
  "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master"
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runScenario(browser, name) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
  })
  const page = await context.newPage()
  const result = {
    name,
    waitMs,
    externalRequests: [],
    websocketTraffic: {},
    allowedWebsockets: [],
    blockedWebsockets: [],
    pageErrors: [],
    errors: [],
  }
  const startedAt = Date.now()
  if (name.startsWith("warm-")) {
    await page.goto(origin + "/trade/swap/market", {
      waitUntil: "domcontentloaded",
    })
    await delay(waitMs)
    result.warm = {
      inputEditable: await page.locator("input").first().isEditable(),
      skeletons: await page.locator(".react-loading-skeleton").count(),
    }
    if (!result.warm.inputEditable)
      throw new Error("Warm baseline failed; cached outage test is invalid")
  }
  page.on("pageerror", (error) => result.pageErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && result.errors.length < 30)
      result.errors.push(message.text().slice(0, 700))
  })
  page.on("websocket", (ws) => {
    const key = ws.url()
    const entry = (result.websocketTraffic[key] = {
      sent: 0,
      received: 0,
      methods: {},
      closed: false,
    })
    ws.on("framesent", (frame) => {
      entry.sent++
      rpcEvidence.request(entry, frame.payload)
      try {
        const message = JSON.parse(String(frame.payload))
        if (message.method)
          entry.methods[message.method] =
            (entry.methods[message.method] || 0) + 1
      } catch {}
    })
    ws.on("framereceived", (frame) => {
      entry.received++
      rpcEvidence.response(entry, frame.payload)
    })
    ws.on("close", () => (entry.closed = true))
  })
  if (name !== "baseline") {
    await context.route("**/*", async (route) => {
      const url = route.request().url()
      if (
        url.startsWith(origin) ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
      )
        return route.continue()
      if (hydrationHttpOrigins.has(new URL(url).origin)) return route.continue()
      result.externalRequests.push(url)
      if (name === "neckwork-malformed-stats") {
        if (url.includes("/v1/stats/platform"))
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ tvl: {}, volume24h: {} }),
            headers: { "access-control-allow-origin": "*" },
          })
        return route.continue()
      }
      if (name.startsWith("metadata-")) {
        if (url.startsWith(metadataUrl) && url.endsWith(".json")) {
          if (name === "metadata-hang") return undefined
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: '{"error":"simulated upstream outage"}',
            headers: { "access-control-allow-origin": "*" },
          })
        }
        return route.continue()
      }
      if (name === "all-external-reject") return route.abort("failed")
      // Leave the intercepted request unanswered until context teardown.
      return undefined
    })
    if (name.includes("all-external")) {
      await context.routeWebSocket(/.*/, (ws) => {
        if (hydrationRpcs.has(new URL(ws.url()).href)) {
          result.allowedWebsockets.push(ws.url())
          const server = ws.connectToServer()
          const entry = (result.websocketTraffic[ws.url()] = {
            sent: 0,
            received: 0,
            methods: {},
            closed: false,
          })
          ws.onMessage((message) => {
            entry.sent++
            rpcEvidence.request(entry, message)
            try {
              const frame = JSON.parse(String(message))
              if (frame.method)
                entry.methods[frame.method] =
                  (entry.methods[frame.method] || 0) + 1
            } catch {}
            server.send(message)
          })
          server.onMessage((message) => {
            entry.received++
            rpcEvidence.response(entry, message)
            ws.send(message)
          })
        } else {
          result.blockedWebsockets.push(ws.url())
          ws.close({ code: 1011, reason: "simulated non-Hydration RPC outage" })
        }
      })
    }
  }
  try {
    await page.goto(
      origin +
        (name === "neckwork-malformed-stats"
          ? "/liquidity"
          : "/trade/swap/market"),
      { waitUntil: "domcontentloaded", timeout: 30000 },
    )
    await delay(waitMs)
    result.elapsedMs = Date.now() - startedAt
    result.url = page.url()
    result.bodyText = await page.locator("body").innerText()
    result.buttons = await page.getByRole("button").allTextContents()
    result.links = await page.getByRole("link").allTextContents()
    if (name === "neckwork-malformed-stats") {
      result.liquidityPoolLinks = await page
        .locator('a[href^="/liquidity/"][href$="/add"]')
        .count()
    }
    result.inputs = await page.locator("input").count()
    result.skeletons = await page.locator(".react-loading-skeleton").count()
    result.inputEditable =
      result.inputs > 0 && (await page.locator("input").first().isEditable())
    if (result.inputs === 2 && result.inputEditable) {
      const gotIt = page.getByRole("button", { name: "Got it", exact: true })
      if (await gotIt.isVisible()) await gotIt.click()
      await page.locator("input").first().fill("1", { timeout: 5000 })
      await delay(4000)
      result.quoteInputValues = await page
        .locator("input")
        .evaluateAll((inputs) => inputs.map((input) => input.value))
    }
    await page
      .screenshot({
        path: path.join(auditDir, name + ".png"),
        fullPage: true,
        timeout: 5000,
      })
      .catch((error) => {
        result.screenshotError = error.message
      })
  } catch (error) {
    result.harnessError = error.stack
  }
  fs.writeFileSync(
    path.join(auditDir, name + ".json"),
    JSON.stringify(result, null, 2) + "\n",
  )
  console.log(
    JSON.stringify({
      name,
      elapsedMs: result.elapsedMs,
      body: result.bodyText?.slice(0, 1800),
      buttons: result.buttons,
      inputs: result.inputs,
      skeletons: result.skeletons,
      pageErrors: result.pageErrors,
      ws: result.websocketTraffic,
    }),
  )
  await context.close()
  return result
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.AUDIT_CHROMIUM_EXECUTABLE || undefined,
    args: ["--no-sandbox"],
  })
  try {
    const results = await Promise.all(
      scenarios.map((name) => runScenario(browser, name)),
    )
    fs.writeFileSync(
      path.join(auditDir, "browser-results.json"),
      JSON.stringify(results, null, 2) + "\n",
    )
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
