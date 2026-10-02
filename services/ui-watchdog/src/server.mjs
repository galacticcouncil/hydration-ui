import { createServer } from "node:http"
import { escapeHtml as h } from "./util.mjs"

export function dashboard(status, events) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="30"><title>Hydration UI watchdog</title><style>
  :root{color-scheme:dark}body{font:16px system-ui;background:#0a1420;color:#e0e8f0;margin:0 auto;padding:40px 24px;max-width:1100px}h1{font-size:28px}a{color:#84d9fa}code{font-size:13px;overflow-wrap:anywhere}.state{font-size:22px;padding:18px;border:1px solid #687786;border-radius:8px}.verified{border-color:#53c3a0}.integrity_alert,.down{border-color:#ff657d}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #24384b;vertical-align:top}small{color:#9eafc0}pre{white-space:pre-wrap;overflow-wrap:anywhere}details{margin:16px 0}dt{color:#9eafc0}dd{margin:4px 0 18px}
  </style><h1>Hydration UI watchdog</h1><p><a href="${h(status.target)}">${h(status.target)}</a> · <a href="/api/status">Status JSON</a> · <a href="/api/events">History JSON</a></p>
  <div class="state ${h(status.state)}">${h(status.state)}<p><small>${h((status.reasons || []).join(" · "))}</small></p></div>
  <dl><dt>Expected production commit</dt><dd><code>${h(status.source?.sha || "unknown")}</code></dd><dt>Matching independent build</dt><dd><code>${h(status.probe?.matchedSha || "unverified")}</code></dd><dt>Last observation</dt><dd>${h(status.probe?.at || "pending")}</dd><dt>Last asset scan</dt><dd>${h(status.audit?.completedAt || "pending")} · ${h(status.audit?.filesChecked || 0)} files · ${h(status.audit?.scope || "pending")}</dd><dt>GitHub references</dt><dd>${h(status.references?.state || "pending")} · ${h(status.references?.message || "")}</dd><dt>Discord</dt><dd>${status.notifications?.configured ? "configured" : "disabled — set DISCORD_WEBHOOK_URL"} · ${h(status.notifications?.pending || 0)} queued</dd></dl>
  <details><summary>Verification details</summary><pre>${h(JSON.stringify({ sourceError: status.sourceError, audit: status.audit, browser: status.browser }, null, 2))}</pre></details>
  <h2>Change and incident history</h2><table><thead><tr><th>Observed at</th><th>Event</th><th>Details</th></tr></thead><tbody>${events.map((e) => `<tr><td>${h(e.at)}</td><td>${h(e.kind)}<br><small>${h(e.severity)}</small></td><td>${h(e.data.summary || e.data.state || "")}${e.data.changelog ? `<p><a href="${h(e.data.changelog.url)}">Commit comparison</a></p>` : ""}${e.data.paths ? `<details><summary>Changed files (${e.data.paths.length})</summary><pre>${h(e.data.paths.join("\n"))}</pre></details>` : ""}</td></tr>`).join("")}</tbody></table>
  <p><small>Checks compare observed bytes with independent source builds. They do not certify source-code safety or cover every visitor. HTML is checked every ${h(status.pollSeconds)} seconds; full files and browser checks have separate timestamps.</small></p></html>`
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
