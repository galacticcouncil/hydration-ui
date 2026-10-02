import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { probeBrowser } from "../src/browser.mjs"
import { sha256 } from "../src/util.mjs"

test(
  "real Chromium detects dynamic script tampering and unexpected scripts",
  { timeout: 90000 },
  async (t) => {
    const app =
      'document.querySelector("#root").textContent="Hydration trade liquidity borrow portfolio application reference rendering for watchdog browser validation."; import("/lazy.js")'
    const files = {
      "/index.html":
        '<!doctype html><div id="root"></div><script type="module" src="/app.js"></script>',
      "/app.js": app,
      "/lazy.js": "globalThis.reference = true",
    }
    const reference = {
      sha: "a".repeat(40),
      files: Object.fromEntries(
        Object.entries(files).map(([k, v]) => [
          k,
          { sha256: sha256(v), size: Buffer.byteLength(v) },
        ]),
      ),
    }
    const server = createServer((req, res) => {
      if (req.url === "/favicon.ico") {
        res.writeHead(204).end()
        return
      }
      const p = req.url === "/" ? "/index.html" : req.url
      res.setHeader(
        "content-type",
        p.endsWith(".js") ? "application/javascript" : "text/html",
      )
      res.end(files[p] || "")
    })
    await new Promise((r) => server.listen(0, "127.0.0.1", r))
    t.after(() => {
      server.closeAllConnections()
      server.close()
    })
    const c = {
      target: `http://127.0.0.1:${server.address().port}`,
      routes: ["/"],
      externalScripts: {},
      frameOrigins: [],
    }
    const options = {
      allowNetwork: async () => true,
      checkEgress: false,
      executablePath: process.env.CHROMIUM_EXECUTABLE,
    }
    const good = await probeBrowser(
      c,
      reference,
      reference.files["/index.html"].sha256,
      options,
    )
    assert.deepEqual(good.issues, [])
    assert(good.routes[0].rendered)
    files["/lazy.js"] =
      'globalThis.reference = false; const s = document.createElement("script"); s.src="/injected.js"; document.head.append(s)'
    files["/injected.js"] = "globalThis.injected = true"
    const bad = await probeBrowser(
      c,
      reference,
      reference.files["/index.html"].sha256,
      options,
    )
    assert(
      bad.issues.some(
        (x) => x.kind === "hash-mismatch" && x.path === "/lazy.js",
      ),
      JSON.stringify(bad.issues),
    )
    assert(
      bad.issues.some(
        (x) => x.kind === "unexpected-resource" && x.path === "/injected.js",
      ),
      JSON.stringify(bad.issues),
    )
  },
)

// A public-looking hostname that exists only inside the SOCKS fixture proves
// Chromium uses remote DNS. The loopback-origin check proves no direct fallback.
test(
  "real Chromium uses SOCKS for documents and scripts and fails closed",
  { timeout: 90000 },
  async (t) => {
    const { socksFixture } = await import("./proxy-fixture.mjs")
    let hits = 0
    const html = '<div id="root"></div><script src="/app.js"></script>'
    const script =
      'document.querySelector("#root").textContent="Hydration network observer browser proxy verification with enough application text for a successful render."'
    const server = createServer((req, res) => {
      hits++
      res.setHeader(
        "content-type",
        req.url === "/app.js" ? "application/javascript" : "text/html",
      )
      res.end(req.url === "/app.js" ? script : html)
    })
    await new Promise((r) => server.listen(0, "127.0.0.1", r))
    t.after(() => {
      server.closeAllConnections()
      server.close()
    })
    const proxy = await socksFixture(t, server.address().port)
    const c = {
      target: "http://remote.invalid",
      proxyUrl: proxy.url,
      requireProxy: true,
      routes: ["/"],
      externalScripts: {},
      frameOrigins: [],
    }
    const options = {
      allowNetwork: async () => true,
      checkEgress: false,
      executablePath: process.env.CHROMIUM_EXECUTABLE,
    }
    const good = await probeBrowser(c, null, sha256(html), options)
    assert.equal(good.routes[0].rendered, true, JSON.stringify(good))
    assert.deepEqual(good.issues, [])
    assert(
      proxy.destinations.some(
        (d) => d.type === 3 && d.host === "remote.invalid",
      ),
    )
    proxy.close()
    const before = hits
    const bad = await probeBrowser(
      { ...c, target: `http://127.0.0.1:${server.address().port}` },
      null,
      sha256(html),
      options,
    )
    assert.equal(bad.routes[0].rendered, false)
    assert.equal(
      hits,
      before,
      "Chromium must never bypass a failed proxy for loopback",
    )
  },
)
