import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { brotliCompressSync } from "node:zlib"
import { probeBrowser } from "../src/browser.mjs"
import { chromeTransport } from "../src/chrome.mjs"
import { assess, observe } from "../src/scan.mjs"
import { sha256 } from "../src/util.mjs"

const script = Buffer.from(
  `export const data = "${Array.from({ length: 12000 }, (_, i) => sha256(String(i))).join("")}"`,
)
const compressed = brotliCompressSync(script)
const html =
  '<!doctype html><link rel="modulepreload" href="/chunk.js"><div id="root">Hydration watchdog transfer fixture with enough application text to pass the rendered browser check.</div><script type="module" src="/chunk.js"></script>'
const reference = {
  sha: "a".repeat(40),
  files: {
    "/index.html": { sha256: sha256(html), size: Buffer.byteLength(html) },
    "/chunk.js": { sha256: sha256(script), size: script.length },
  },
}

async function fixture(
  t,
  { fail = () => true, encoding = "br", served = script } = {},
) {
  let attempts = 0
  const body =
    encoding === "br"
      ? served === script
        ? compressed
        : brotliCompressSync(served)
      : served
  const server = createServer((req, res) => {
    if (req.url !== "/chunk.js") {
      res.writeHead(200, { "content-type": "text/html" }).end(html)
      return
    }
    const partial = fail(++attempts)
    res.writeHead(200, {
      "content-type": "application/javascript",
      "content-length": body.length,
      ...(encoding === "br" ? { "content-encoding": "br" } : {}),
      connection: "close",
    })
    res.end(partial ? body.subarray(0, Math.floor(body.length * 0.7)) : body)
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const c = {
    target: `http://127.0.0.1:${server.address().port}`,
    timeoutMs: 2000,
    concurrency: 1,
    externalScripts: {},
    routes: ["/"],
    settleMs: 20,
    frameOrigins: [],
  }
  const transport = await chromeTransport(c, {
    allowNetwork: async () => true,
    executablePath: process.env.CHROMIUM_EXECUTABLE,
  })
  t.after(() => transport.close())
  return {
    c: { ...c, siteRequest: transport.request },
    attempts: () => attempts,
  }
}

for (const encoding of ["br", "identity"])
  test(
    `${encoding} transfer cut short is a fetch failure, not a content mismatch`,
    { timeout: 15000 },
    async (t) => {
      const f = await fixture(t, { encoding })
      const result = await observe(f.c, [reference], { full: true })
      assert.deepEqual(
        result.issues.map((i) => [i.kind, i.path]),
        [["fetch-failed", "/chunk.js"]],
      )
      assert.equal(result.observed["/chunk.js"], undefined)
      assert.deepEqual(result.evidence, [])
      assert.equal(assess({ probe: result }).state, "degraded")
      assert.equal(f.attempts(), 2)
    },
  )

test(
  "a retry fetches a complete module after an interrupted transfer",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t, { fail: (attempt) => attempt === 1 })
    const result = await observe(f.c, [reference], { full: true })
    assert.deepEqual(result.issues, [])
    assert.deepEqual(result.evidence, [])
    assert.equal(
      result.observed["/chunk.js"].sha256,
      reference.files["/chunk.js"].sha256,
    )
    assert.equal(f.attempts(), 2)
  },
)

test(
  "a completely delivered shorter file remains an integrity alert without a retry",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t, {
      served: script.subarray(0, Math.floor(script.length * 0.7)),
      fail: () => false,
    })
    const result = await observe(f.c, [reference], { full: true })
    assert.deepEqual(
      result.issues.map((i) => [i.kind, i.path]),
      [["hash-mismatch", "/chunk.js"]],
    )
    assert.equal(assess({ probe: result }).state, "integrity_alert")
    assert.equal(result.evidence.length, 1)
    assert.equal(f.attempts(), 1)
  },
)

test(
  "rendered checks do not hash partial responses from failed transfers",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t)
    const result = await probeBrowser(
      f.c,
      reference,
      reference.files["/index.html"].sha256,
      {
        allowNetwork: async () => true,
        checkEgress: false,
        executablePath: process.env.CHROMIUM_EXECUTABLE,
      },
    )
    assert(result.issues.some((i) => i.path === "/chunk.js"))
    assert(!result.issues.some((i) => i.kind === "hash-mismatch"))
    assert(!result.responses.some((r) => r.path === "/chunk.js"))
    assert.deepEqual(result.evidence, [])
    assert.equal(assess({ probe: result }).state, "degraded")
  },
)
