// Round 2, Chromium byte transport (needs Chromium: run like
// test/browser.integration.mjs). src/chrome.mjs:323 builds `new Headers(
// allHeaders())`: repeated Set-Cookie is joined with "\n", so a tampered file is
// fetch-failed, not hash-mismatch. chrome.mjs:75 rewrites every request's
// headers (order tell); chrome.mjs:259 bootstraps on a blank page without an
// icon (/favicon.ico request) and chrome.mjs:270 preloads every file from
// <origin>/ (referer tell). Fails at e29022890 + fix-n1 by design.
import test from "node:test"
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { probeBrowser } from "../src/browser.mjs"
import { chromeTransport } from "../src/chrome.mjs"
import { config } from "../src/config.mjs"
import { assess, observe } from "../src/scan.mjs"
import { manifest, sha256 } from "./review-fixtures.mjs"
import { firstRequests, origin } from "./fixtures/round2-origin.mjs"

const executablePath = process.env.CHROMIUM_EXECUTABLE
const text =
  "Hydration transport fixture page with enough application text for the watchdog render check."

// Vite-like release: index.html names the entry script and stylesheet; the
// wallet chunk is lazy, known only from the manifest, like on-demand app code.
const files = {
  "/index.html": `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="/favicon/favicon.ico"><script type="module" crossorigin src="/assets/app.js"></script><link rel="stylesheet" crossorigin href="/assets/index.css"></head><body><div id="root"></div><p class="f">x</p></body></html>`,
  "/assets/app.js": `document.querySelector("#root").textContent = ${JSON.stringify(text)}`,
  "/assets/wallet.js": `export const sign = () => "trusted"`,
  "/assets/index.css": `@font-face{font-family:f;src:url(/assets/font.woff2) format("woff2")}.f{font-family:f}`,
  "/assets/font.woff2": "wOF2-fixture",
  // A decodable image: Chromium keeps no body for bytes it cannot decode.
  "/favicon.ico": Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  ),
}
const tampered = `export const sign = () => "drain()"`
const twoCookies = { "set-cookie": ["a=1; Path=/", "b=2; Path=/"] }
const shaR = "d".repeat(40)

async function audit(o, reference, extra = {}) {
  const c = {
    target: o.target,
    timeoutMs: 10000,
    concurrency: 4,
    externalScripts: {},
    routes: ["/trade/swap"],
    ...extra,
  }
  const t = await chromeTransport(c, {
    allowNetwork: async () => true,
    executablePath,
  })
  try {
    return await observe({ ...c, siteRequest: t.request }, [reference], {
      full: true,
    })
  } finally {
    await t.close()
  }
}
const describe = (issues) =>
  JSON.stringify(
    issues.map((i) => `${i.kind} ${i.path} ${i.message || ""}`.trim()),
  )

test(
  "Round 2 transport: a tampered chunk served with two Set-Cookie headers is still a hash mismatch",
  { timeout: 120000 },
  async (t) => {
    const reference = manifest(shaR, files)
    const o = await origin(t, files, (url) =>
      url.pathname === "/assets/wallet.js"
        ? { headers: twoCookies, body: tampered }
        : null,
    )
    const result = await audit(o, reference)
    assert(
      result.issues.some(
        (i) => i.kind === "hash-mismatch" && i.path === "/assets/wallet.js",
      ),
      `the tampered wallet chunk was not reported as a hash mismatch; issues: ${describe(result.issues)}`,
    )
    assert.equal(
      assess({ probe: result }).state,
      "integrity_alert",
      `a tampered chunk with two Set-Cookie headers must raise integrity_alert; issues: ${describe(result.issues)}`,
    )
  },
)

test(
  "Round 2 transport: clean files and favicon.ico served with repeated Set-Cookie and Cache-Status headers are hashed",
  { timeout: 120000 },
  async (t) => {
    const reference = manifest(shaR, files)
    // Netlify also repeats Cache-Status. CDP (the favicon path) joins repeated
    // headers with newlines and leaves Set-Cookie out of its response headers.
    const repeated = {
      ...twoCookies,
      "cache-status": ['"Netlify Durable"; hit', '"Netlify Edge"; fwd=stale'],
    }
    const icon = await origin(t, files, (url) =>
      url.pathname === "/favicon.ico" ? { headers: repeated } : null,
    )
    const only = await audit(icon, reference)
    assert.equal(
      only.observed["/favicon.ico"]?.sha256,
      sha256(files["/favicon.ico"]),
      `favicon.ico with repeated response headers was not hashed; issues: ${describe(only.issues)}`,
    )
    const o = await origin(t, files, () => ({ headers: repeated }))
    const result = await audit(o, reference)
    assert.equal(
      result.error,
      undefined,
      `the root document with repeated response headers could not be read: ${result.error}`,
    )
    assert.deepEqual(
      describe(result.issues),
      "[]",
      "clean files with repeated Set-Cookie or Cache-Status headers must be hashed without issues",
    )
  },
)

test(
  "Round 2 transport: audit and rendered-probe requests send headers in a plain Chromium page's order",
  { timeout: 180000 },
  async (t) => {
    const reference = manifest(shaR, files)
    const o = await origin(t, files)
    o.phase = "plain"
    const plain = await chromium.launch({
      channel: "chromium",
      executablePath,
      args: ["--lang=en-US"],
    })
    try {
      const page = await plain.newPage()
      await page.goto(`${o.target}/`)
      await page.waitForFunction(
        () => document.querySelector("#root")?.textContent.length > 80,
      )
      await page.evaluate(() => document.fonts.ready)
    } finally {
      await plain.close()
    }
    o.phase = "audit"
    await audit(o, reference)
    o.phase = "probe"
    await probeBrowser(
      {
        ...config({ ROLE: "observer" }),
        target: o.target,
        externalScripts: {},
        frameOrigins: [],
        routes: ["/"],
        sampleRoutes: false,
        settleMs: 300,
      },
      reference,
      sha256(files["/index.html"]),
      { allowNetwork: async () => true, checkEgress: false, executablePath },
    )
    const expected = firstRequests(o.log, "plain")
    for (const path of [
      "/",
      "/assets/app.js",
      "/assets/index.css",
      "/assets/font.woff2",
    ])
      assert(expected[path], `the plain page never requested ${path}`)
    const audited = firstRequests(o.log, "audit")
    for (const [path, kind] of [
      ["/", "document"],
      ["/assets/app.js", "module script"],
      ["/assets/index.css", "stylesheet"],
      ["/assets/font.woff2", "font"],
    ])
      assert.deepEqual(
        audited[path],
        expected[path],
        `the audit's ${kind} request for ${path} sends headers in a different order from a plain Chromium page`,
      )
    const probed = firstRequests(o.log, "probe")
    for (const [path, kind] of [
      ["/", "document"],
      ["/assets/app.js", "module script"],
    ])
      assert.deepEqual(
        probed[path],
        expected[path],
        `the rendered probe's ${kind} request for ${path} sends headers in a different order from a plain Chromium page`,
      )
  },
)

test(
  "Round 2 transport: an audit never requests /favicon.ico when the app declares its icon elsewhere",
  { timeout: 120000 },
  async (t) => {
    const { "/favicon.ico": _, ...app } = files
    const o = await origin(t, app)
    await audit(o, manifest(shaR, app))
    assert.deepEqual(
      o.log.filter((r) => r.path === "/favicon.ico").map((r) => r.path),
      [],
      "the audit requested /favicon.ico, which a browser on the real index.html never does",
    )
  },
)

test(
  "Round 2 transport: a lazy chunk cloaked on referer / is detected; entry files keep referer /",
  { timeout: 120000 },
  async (t) => {
    const reference = manifest(shaR, files)
    // Users fetch on-demand chunks from the route they are on, never from /.
    const o = await origin(t, files, (url, req) =>
      url.pathname === "/assets/wallet.js" &&
      new URL(req.headers.referer || "http://x/none").pathname !== "/"
        ? { body: tampered }
        : null,
    )
    const result = await audit(o, reference)
    const wallet = o.log.filter((r) => r.path === "/assets/wallet.js")
    assert(
      result.issues.some(
        (i) => i.kind === "hash-mismatch" && i.path === "/assets/wallet.js",
      ),
      `the lazy wallet chunk cloaked on referer / was not detected; it was requested with referer ${JSON.stringify(wallet.map((r) => r.referer))}`,
    )
    assert.equal(assess({ probe: result }).state, "integrity_alert")
    for (const path of ["/assets/app.js", "/assets/index.css"])
      assert.deepEqual(
        o.log.filter((r) => r.path === path).map((r) => r.referer),
        [`${o.target}/`],
        `the entry file ${path} named by index.html must be requested once, with referer ${o.target}/, like a user landing on /`,
      )
  },
)
