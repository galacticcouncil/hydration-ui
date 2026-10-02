import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { probeBrowser } from "../src/browser.mjs"
import { sha256 } from "../src/util.mjs"
import { chromeTransport } from "../src/chrome.mjs"
import { observe, assess } from "../src/scan.mjs"

async function browserFixture(t, handler, configure = () => {}) {
  const script =
    'document.querySelector("#root").textContent="Hydration application rendered with enough content for the full browser verification fixture to pass."; fetch("/slow.bin")'
  const html =
    '<!doctype html><div id="root"></div><script src="/app.js"></script>'
  const files = {
    "/index.html": html,
    "/app.js": script,
    "/slow.bin": "trusted slow body",
  }
  configure(files)
  const server = createServer((req, res) => {
    const p =
      req.url === "/app.js" || req.url === "/slow.bin" ? req.url : "/index.html"
    if (handler(req, res, p, files) === true) return
    res.setHeader(
      "content-type",
      p.endsWith(".js")
        ? "application/javascript"
        : p.endsWith(".bin")
          ? "application/octet-stream"
          : "text/html",
    )
    res.end(files[p])
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const c = {
    target: `http://127.0.0.1:${server.address().port}`,
    routes: ["/"],
    timeoutMs: 3000,
    settleMs: 50,
    externalScripts: {},
    frameOrigins: [],
  }
  const reference = {
    sha: "a".repeat(40),
    files: Object.fromEntries(
      Object.entries(files).map(([p, b]) => [
        p,
        { sha256: sha256(b), size: b.length },
      ]),
    ),
  }
  return {
    c,
    reference,
    root: sha256(html),
    options: { allowNetwork: async () => true, checkEgress: false },
  }
}

test(
  "slow trusted body is hashed before closing its page",
  { timeout: 15000 },
  async (t) => {
    const f = await browserFixture(t, (req, res, p, files) => {
      if (p !== "/slow.bin") return false
      res.writeHead(200, { "content-type": "application/octet-stream" })
      res.write(files[p].slice(0, 4))
      setTimeout(() => res.end(files[p].slice(4)), 700)
      return true
    })
    const result = await probeBrowser(f.c, f.reference, f.root, f.options)
    assert.deepEqual(result.issues, [])
    assert(
      result.responses.some(
        (r) =>
          r.path === "/slow.bin" &&
          r.sha256 === f.reference.files["/slow.bin"].sha256,
      ),
    )
  },
)

test(
  "app modals cannot block link probes or introduce a second live navigation",
  { timeout: 15000 },
  async (t) => {
    const documents = []
    const f = await browserFixture(
      t,
      (req) => {
        if (req.headers["sec-fetch-dest"] === "document")
          documents.push(req.headers)
      },
      (files) => {
        files["/app.js"] +=
          ';const modal=document.createElement("dialog");modal.textContent="Accept terms";document.body.append(modal);modal.showModal()'
      },
    )
    const result = await probeBrowser(
      { ...f.c, routes: ["/modal-test"], sampleRoutes: true },
      f.reference,
      f.root,
      f.options,
    )
    assert.deepEqual(result.issues, [])
    assert(result.routes.every((r) => r.rendered))
    assert.equal(documents.length, result.routes.length)
    for (const h of documents) {
      assert.equal(h["sec-fetch-site"], "same-origin")
      assert.equal(h["sec-fetch-user"], "?1")
      assert(h.referer?.startsWith(f.c.target))
    }
  },
)

test(
  "fake page served only to real-looking Chrome is detected",
  { timeout: 15000 },
  async (t) => {
    let realChrome = false
    const f = await browserFixture(t, (req, res, p, files) => {
      if (p !== "/index.html") return false
      realChrome =
        !JSON.stringify(req.headers).includes("HeadlessChrome") &&
        req.headers["sec-ch-ua"]?.includes("Chromium")
      res.setHeader("content-type", "text/html")
      res.end(
        files[p] + (realChrome ? "<!-- malicious Chrome-only payload -->" : ""),
      )
      return true
    })
    const result = await probeBrowser(f.c, f.reference, f.root, f.options)
    assert(realChrome)
    assert.equal(
      assess({ probe: { issues: [], rootHash: f.root }, browser: result })
        .state,
      "integrity_alert",
    )
  },
)

test(
  "link-click and deep-route cloaks are detected",
  { timeout: 60000 },
  async (t) => {
    let linkHit = false,
      deepHit = false
    const f = await browserFixture(t, (req, res, p, files) => {
      if (p !== "/index.html") return false
      const link =
        req.headers["sec-fetch-site"] === "same-origin" &&
        req.headers["sec-fetch-mode"] === "navigate"
      const deep = req.url.startsWith("/submit-transaction")
      linkHit ||= link
      deepHit ||= deep
      res.setHeader("content-type", "text/html")
      res.end(
        files[p] +
          (link || deep ? "<!-- malicious selective document -->" : ""),
      )
      return true
    })
    const result = await probeBrowser(
      { ...f.c, sampleRoutes: true, routes: ["/submit-transaction"] },
      f.reference,
      f.root,
      f.options,
    )
    assert(linkHit)
    assert(deepHit)
    assert.equal(
      assess({ probe: { issues: [], rootHash: f.root }, browser: result })
        .state,
      "integrity_alert",
    )
  },
)

test(
  "Chromium byte scanner exposes real navigation/script headers, decodes compression, and detects script-only cloaking",
  { timeout: 60000 },
  async (t) => {
    const { gzipSync } = await import("node:zlib")
    const hits = []
    const html = '<div id="root"></div><script src="/app.js"></script>'
    const files = {
      "/index.html": html,
      "/app.js": "trusted()",
      "/lazy.js": "trustedLazy()",
    }
    let malicious = false
    const server = createServer((req, res) => {
      hits.push(req.headers)
      const p = req.url === "/" ? "/index.html" : req.url
      const body =
        malicious &&
        p === "/lazy.js" &&
        req.headers["sec-fetch-dest"] === "script"
          ? "evil()"
          : files[p]
      res
        .writeHead(200, {
          "content-type": p.endsWith(".js")
            ? "application/javascript"
            : "text/html",
          "content-encoding": "gzip",
        })
        .end(gzipSync(body || ""))
    })
    await new Promise((r) => server.listen(0, "127.0.0.1", r))
    t.after(() => {
      server.closeAllConnections()
      server.close()
    })
    const c = {
      target: `http://127.0.0.1:${server.address().port}`,
      concurrency: 2,
      externalScripts: {},
      timeoutMs: 5000,
    }
    const reference = {
      sha: "a".repeat(40),
      files: Object.fromEntries(
        Object.entries(files).map(([p, b]) => [
          p,
          { sha256: sha256(b), size: b.length },
        ]),
      ),
    }
    async function scan() {
      const browser = await chromeTransport(c, {
        allowNetwork: async () => true,
      })
      try {
        return await observe(
          { ...c, siteRequest: browser.request },
          [reference],
          { full: true },
        )
      } finally {
        await browser.close()
      }
    }
    const clean = await scan()
    assert.deepEqual(clean.issues, [])
    assert.equal(clean.filesChecked, 3)
    for (const h of hits) {
      assert(!JSON.stringify(h).includes("HeadlessChrome"))
      assert.equal(h.pragma, undefined)
      assert.equal(h["cache-control"], undefined)
      assert(h["sec-fetch-dest"])
      assert(h["accept-language"].startsWith("en-US"))
    }
    malicious = true
    const bad = await scan()
    assert.equal(
      assess({ probe: bad }).state,
      "integrity_alert",
      JSON.stringify(bad),
    )
    assert(
      bad.issues.some(
        (i) => i.path === "/lazy.js" && i.kind === "hash-mismatch",
      ),
    )
  },
)

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

test(
  "enabled browser egress validation calls the checker and records its result",
  { timeout: 15000 },
  async (t) => {
    const f = await browserFixture(t, () => false)
    let called = false
    const result = await probeBrowser(f.c, f.reference, f.root, {
      ...f.options,
      checkEgress: true,
      egressChecker: async () => {
        called = true
        return {
          ip: "1.1.1.1",
          tor: false,
          checkedAt: new Date().toISOString(),
        }
      },
    })
    assert(called)
    assert.equal(result.egress.ip, "1.1.1.1")
    assert.deepEqual(result.issues, [])
  },
)
