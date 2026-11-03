import { timingSafeEqual } from "node:crypto"
import { createServer } from "node:http"
import { escapeHtml as h } from "./util.mjs"

// Explicit projection also protects old persisted events that contain exit IPs.
export function publicStatus(s) {
  return { target: s.target, repository: s.repository, state: "private" }
}
export function publicEvents() {
  return []
}
export function dashboard(status, events) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hydration UI watchdog</title>
  <style>body{font:16px system-ui;max-width:900px;margin:40px auto;padding:20px;background:#0a1420;color:#e0e8f0}a{color:#84d9fa}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>
  <h1>Hydration UI watchdog</h1><p>${h(status.state)}</p><p>${h((status.reasons || []).join("; "))}</p>
  <p>Production: <code>${h(status.source?.sha || "pending")}</code></p>
  <p><a href="/api/status">Authenticated status</a> · <a href="/api/events">Authenticated history</a></p>
  <p>Detailed network diagnostics and captured evidence are available only to authenticated operators.</p>
  <h2>Change log</h2>${events.map((e) => `<p>${h(e.kind)} · ${h(e.severity)}</p>`).join("")}
  <p>Observed bytes are compared with independent builds. Verification does not certify source safety or every visitor's response.</p></html>`
}

function authorized(req, token) {
  if (!token) return false
  const header = req.headers.authorization || ""
  const supplied = header.startsWith("Bearer ")
    ? header.slice(7)
    : header.startsWith("Basic ")
      ? Buffer.from(header.slice(6), "base64")
          .toString()
          .split(":")
          .slice(1)
          .join(":")
      : ""
  const a = Buffer.from(supplied),
    b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function serve(c, store, getStatus, isHealthy) {
  return createServer((req, res) => {
    const url = new URL(req.url, "http://localhost")
    res.setHeader("cache-control", "no-store")
    res.setHeader("x-content-type-options", "nosniff")
    res.setHeader(
      "content-security-policy",
      "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'",
    )
    if (req.method !== "GET") {
      res.writeHead(405).end()
      return
    }
    if (url.pathname === "/healthz") {
      res.writeHead(isHealthy() ? 200 : 503).end(isHealthy() ? "ok" : "stalled")
      return
    }
    if (!authorized(req, c.adminToken)) {
      res
        .writeHead(401, {
          "content-type": "application/json",
          "www-authenticate": 'Basic realm="UI watchdog"',
        })
        .end(JSON.stringify({ error: "Authentication required" }))
      return
    }
    if (url.pathname === "/api/evidence") {
      const hash = url.searchParams.get("hash") || ""
      if (!/^[a-f0-9]{64}$/.test(hash)) return res.writeHead(400).end()
      res.setHeader("content-type", "application/json")
      return res.end(JSON.stringify(store.evidence(hash)))
    }
    if (url.pathname === "/api/status") {
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify(getStatus()))
      return
    }
    if (url.pathname === "/api/events") {
      const n = Number(url.searchParams.get("limit") || 100)
      res.setHeader("content-type", "application/json")
      res.end(
        JSON.stringify(
          store.events(
            Number.isSafeInteger(n) ? Math.max(1, Math.min(500, n)) : 100,
          ),
        ),
      )
      return
    }
    if (url.pathname === "/") {
      res.setHeader("content-type", "text/html; charset=utf-8")
      res.end(dashboard(getStatus(), store.events()))
      return
    }
    res.writeHead(404).end()
  }).listen(c.port, "0.0.0.0")
}
