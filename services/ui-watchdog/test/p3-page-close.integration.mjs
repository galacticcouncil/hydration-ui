// P3 (needs Chromium): browser.mjs:253-254 closes the page before awaiting the
// body-hash jobs, so a trusted resource still downloading at close time (the
// SDK wasm / lazy chunks over Tor) fails with "response.body: Target page,
// context or browser has been closed" -> browser-error -> degraded -> severity
// "error" -> Discord mention (discord.mjs:4-7).
import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { probeBrowser } from "../src/browser.mjs"
import { assess } from "../src/scan.mjs"
import { manifest } from "./review-fixtures.mjs"

test("P3: a slow trusted body is hashed, not reported as a browser error", { timeout: 120000 }, async (t) => {
  const files = {
    "/index.html": '<!doctype html><div id="root"></div><script type="module" src="/assets/app.js"></script>',
    "/assets/app.js":
      'document.querySelector("#root").textContent="Hydration trade liquidity borrow portfolio application rendering for watchdog browser validation.";' +
      'fetch("/assets/math.wasm").then((r) => r.arrayBuffer()).catch(() => {})',
    "/assets/math.wasm": Buffer.alloc(64 * 1024, 7),
  }
  const reference = manifest("d".repeat(40), files)
  const server = createServer(async (req, res) => {
    if (req.url === "/favicon.ico") return res.writeHead(204).end()
    const p = req.url === "/" ? "/index.html" : req.url
    const body = Buffer.from(files[p] ?? files["/index.html"])
    res.writeHead(200, {
      "content-type": p.endsWith(".wasm") ? "application/wasm" : p.endsWith(".js") ? "application/javascript" : "text/html",
      "content-length": body.length,
    })
    if (!p.endsWith(".wasm")) return res.end(body)
    for (let i = 0; i < 10; i++) {
      // ~9 s total: still downloading when the route's 2.5 s settle ends
      if (res.destroyed) return
      res.write(body.subarray((i * body.length) / 10, ((i + 1) * body.length) / 10))
      await new Promise((r) => setTimeout(r, 900))
    }
    res.end()
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const root = reference.files["/index.html"].sha256
  const browser = await probeBrowser(
    { target: `http://127.0.0.1:${server.address().port}`, routes: ["/"], externalScripts: {}, frameOrigins: [] },
    reference,
    root,
    { allowNetwork: async () => true, checkEgress: false, executablePath: process.env.CHROMIUM_EXECUTABLE },
  )
  assert.deepEqual(browser.issues, [])
  assert(browser.responses.some((r) => r.path === "/assets/math.wasm"), "wasm body was hashed")
  const probe = { rootHash: root, matchedSha: reference.sha, issues: [] }
  const audit = { ...probe, full: true, completedAt: new Date().toISOString() }
  assert.equal(
    assess({ probe, audit, browser, source: { sha: reference.sha, firstSeen: 0 } }).state,
    "verified",
  )
})
