// Bypass #2, browser layer (needs Chromium: run like test/browser.integration.mjs).
// At 54527f90e Playwright's default headless mode (chromium-headless-shell)
// sends `sec-ch-ua: "HeadlessChrome";v="153", ...` on every request despite the
// UA override (config.mjs:182-184), exposes navigator.webdriver === true, and
// only performs typed-URL navigations of fixed routes.
import test from "node:test"
import assert from "node:assert/strict"
import { probeBrowser } from "../src/browser.mjs"
import { config } from "../src/config.mjs"
import { assess } from "../src/scan.mjs"
import { A, fakeHtml, html, refA, sha256, site } from "./review-fixtures.mjs"

const options = {
  allowNetwork: async () => true,
  checkEgress: false,
  executablePath: process.env.CHROMIUM_EXECUTABLE,
}
const browserConfig = (target, extra = {}) => ({
  ...config({ ROLE: "observer" }),
  target,
  externalScripts: {},
  frameOrigins: [],
  ...extra,
})
const isDocument = (url) =>
  !url.pathname.startsWith("/assets/") && url.pathname !== "/favicon.ico"
const trustedRoot = sha256(A["/index.html"])
const verdict = (browser) => {
  const probe = { rootHash: trustedRoot, matchedSha: refA.sha, issues: [] }
  return assess({ probe, browser, source: { sha: refA.sha, firstSeen: 0 } }).state
}

test("Bypass #2: the Chromium probe does not identify itself as headless or automated", { timeout: 90000 }, async (t) => {
  let beacon = null
  const app =
    'document.querySelector("#root").textContent="Hydration identity check page with enough application text for the watchdog render check.";' +
    'fetch("/beacon?" + encodeURIComponent(JSON.stringify({ webdriver: navigator.webdriver, brands: navigator.userAgentData?.brands })))'
  const files = {
    "/index.html": '<!doctype html><div id="root"></div><script type="module" src="/assets/app.js"></script>',
    "/assets/app.js": app,
  }
  const s = await site(t, {
    deploy: { files },
    attack: (req, url) => {
      if (url.pathname !== "/beacon") return
      beacon = JSON.parse(decodeURIComponent(url.search.slice(1)))
      return { type: "text/plain", body: "ok" }
    },
  })
  const reference = { sha: "c".repeat(40), files: { "/index.html": { sha256: sha256(files["/index.html"]) } } }
  await probeBrowser(browserConfig(s.target, { routes: ["/"], sampleRoutes: [] }), reference, sha256(files["/index.html"]), options)
  assert(s.log.length > 2)
  for (const r of s.log)
    for (const [k, v] of Object.entries(r.headers))
      assert.doesNotMatch(String(v), /headless/i, `${r.path} ${k}: ${v}`)
  assert.equal(beacon?.webdriver, false, JSON.stringify(beacon))
  assert(!JSON.stringify(beacon.brands).includes("Headless"), JSON.stringify(beacon))
})

test("Bypass #2: a fake served only to real-looking Chrome is detected", { timeout: 120000 }, async (t) => {
  const s = await site(t, {
    deploy: { files: A },
    attack: (req, url) => {
      const ch = req.headers["sec-ch-ua"]
      if (isDocument(url) && ch && !/HeadlessChrome/.test(ch)) return html(fakeHtml())
    },
  })
  const browser = await probeBrowser(browserConfig(s.target), refA, trustedRoot, options)
  assert.equal(verdict(browser), "integrity_alert", JSON.stringify(browser.issues))
})

test("Bypass #2: a fake served only to link-click navigations is detected", { timeout: 120000 }, async (t) => {
  const s = await site(t, {
    deploy: { files: A },
    attack: (req, url) => {
      const from = req.headers["sec-fetch-site"]
      if (isDocument(url) && (req.headers.referer || from === "cross-site" || from === "same-site"))
        return html(fakeHtml())
    },
  })
  const browser = await probeBrowser(browserConfig(s.target), refA, trustedRoot, options)
  assert.equal(verdict(browser), "integrity_alert", JSON.stringify(browser.issues))
})
