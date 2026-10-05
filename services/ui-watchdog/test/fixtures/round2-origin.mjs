// Bare origin for test/round2-transport.integration.mjs. Unlike site() in
// review-fixtures.mjs, replies may repeat headers (two Set-Cookie values), and
// the log keeps each request's raw header-name order and Referer.
import { createServer } from "node:http"

export const typeOf = (p) =>
  p.endsWith(".js")
    ? "text/javascript"
    : p.endsWith(".css")
      ? "text/css"
      : p.endsWith(".woff2")
        ? "font/woff2"
        : p.endsWith(".ico")
          ? "image/x-icon"
          : "text/html; charset=utf-8"

// `reply(url, req)` may return { headers, body } to override the static file;
// missing files get the SPA rewrite to /index.html. `o.phase` tags log entries.
export async function origin(t, files, reply = () => null) {
  const o = { phase: "", log: [] }
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://fixture")
    o.log.push({
      phase: o.phase,
      path: url.pathname,
      names: req.rawHeaders
        .filter((_, i) => i % 2 === 0)
        .map((n) => n.toLowerCase()),
      referer: req.headers.referer ?? null,
    })
    const p = url.pathname === "/" ? "/index.html" : url.pathname
    const file = files[p] === undefined ? "/index.html" : p
    const forced = reply(url, req) || {}
    res.writeHead(200, { "content-type": typeOf(file), ...forced.headers })
    res.end(forced.body ?? files[file])
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  o.target = `http://127.0.0.1:${server.address().port}`
  return o
}

// First request for each path in a phase: path -> header names in wire order.
export function firstRequests(log, phase) {
  const out = {}
  for (const r of log)
    if (r.phase === phase && !(r.path in out)) out[r.path] = r.names
  return out
}
