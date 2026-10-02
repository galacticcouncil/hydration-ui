import { timingSafeEqual } from "node:crypto"
import { chromeTransport } from "./chrome.mjs"
import { publicNetworkPolicy } from "./network.mjs"
import { createServer } from "node:http"
import { probeBrowser } from "./browser.mjs"
import { validateManifest } from "./manifest.mjs"
import { checkEgress } from "./network.mjs"
import { observe } from "./scan.mjs"
import { siteTransport } from "./transport.mjs"
import { safeError, timestamp } from "./util.mjs"

export function serveObserver(c) {
  c = { ...c, siteRequest: siteTransport(c) }
  const busy = new Set()
  let lastSuccess = Date.now(),
    failures = 0
  let network = null,
    networkJob = null
  async function egress() {
    if (
      network &&
      Date.now() - Date.parse(network.checkedAt) <
        (network.error ? 30000 : 300000)
    )
      return network
    if (!networkJob)
      networkJob = (async () => {
        try {
          network = await checkEgress(c, c.siteRequest)
        } catch (e) {
          network = {
            kind: c.egressKind,
            error: safeError(e),
            checkedAt: timestamp(),
          }
        }
        return network
      })().finally(() => {
        networkJob = null
      })
    return networkJob
  }
  const server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/healthz")
      return res
        .writeHead(
          failures < 3 || Date.now() - lastSuccess < 300000 ? 200 : 503,
        )
        .end("observer")
    if (c.workerToken) {
      const expected = Buffer.from(`Bearer ${c.workerToken}`),
        actual = Buffer.from(req.headers.authorization || "")
      if (
        expected.length !== actual.length ||
        !timingSafeEqual(expected, actual)
      )
        return res.writeHead(401).end()
    }
    if (req.method !== "POST" || !["/observe", "/probe"].includes(req.url))
      return res.writeHead(404).end()
    let key,
      owned = false
    try {
      const chunks = []
      let size = 0
      for await (const chunk of req) {
        size += chunk.length
        if (size > 8 * 1024 * 1024)
          throw new Error("Observer request exceeds size limit")
        chunks.push(chunk)
      }
      const body = JSON.parse(Buffer.concat(chunks))
      key = req.url === "/probe" ? "browser" : body.full ? "audit" : "quick"
      if (busy.has(key)) return res.writeHead(429).end()
      busy.add(key)
      owned = true
      let result
      if (req.url === "/observe") {
        if (
          !Array.isArray(body.references) ||
          body.references.length > 12 ||
          typeof body.full !== "boolean"
        )
          throw new Error("Invalid observer request")
        const references = body.references.map((r) => validateManifest(r, c))
        if (
          body.trustedRoots &&
          (Object.keys(body.trustedRoots).length > 50000 ||
            Object.entries(body.trustedRoots).some(
              ([hash, sha]) =>
                !/^[a-f0-9]{64}$/.test(hash) || !/^[a-f0-9]{40}$/.test(sha),
            ))
        )
          throw new Error("Invalid root index")
        const transport = await chromeTransport(c, {
          allowNetwork: publicNetworkPolicy({ remoteDns: Boolean(c.proxyUrl) }),
        })
        try {
          const [observed, path] = await Promise.all([
            observe({ ...c, siteRequest: transport.request }, references, {
              full: body.full,
              trustedRoots: body.trustedRoots,
            }),
            egress(),
          ])
          result = { ...observed, egress: path }
        } finally {
          await transport.close()
        }
      } else {
        if (!/^[a-f0-9]{64}$/.test(body.rootHash))
          throw new Error("Invalid root hash")
        const reference = body.reference
          ? validateManifest(body.reference, c)
          : null
        result = await probeBrowser(c, reference, body.rootHash, {
          references: (body.references || (reference ? [reference] : [])).map(
            (r) => validateManifest(r, c),
          ),
          trustedRoots: body.trustedRoots || {},
        })
      }
      if (result.error) failures++
      else {
        failures = 0
        lastSuccess = Date.now()
      }
      res.setHeader("content-type", "application/json")
      res.end(
        JSON.stringify({
          observerId: c.observerId,
          kind: c.egressKind,
          result,
        }),
      )
    } catch (e) {
      failures++
      console.error(
        JSON.stringify({
          at: timestamp(),
          component: c.observerId,
          error: safeError(e),
        }),
      )
      res
        .writeHead(500, { "content-type": "application/json" })
        .end(JSON.stringify({ error: "Observer check failed" }))
    } finally {
      if (owned) busy.delete(key)
    }
  })
  server.requestTimeout = 300000
  server.headersTimeout = 10000
  server.listen(c.port, "0.0.0.0")
  process.on("SIGTERM", () => server.close(() => process.exit(0)))
  return server
}
