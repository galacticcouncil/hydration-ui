// Shared fixtures for the PR #4109 review regression tests. Drop this file and
// the review test files next to it into services/ui-watchdog/test/.
import { createServer } from "node:http"
import { after } from "node:test"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { config } from "../src/config.mjs"
import { ObserverGroup } from "../src/observers.mjs"
import { observe } from "../src/scan.mjs"
import { sha256 } from "../src/util.mjs"
import { Store } from "../src/store.mjs"

export { sha256 }

// A Vite-like release: content-hashed entry JS/CSS plus a lazy chunk.
export function build(tag) {
  const app = `/assets/index-${tag}.js`,
    lazy = `/assets/lazy-${tag}.js`,
    css = `/assets/index-${tag}.css`
  return {
    "/index.html": `<!doctype html><html><head><title>Hydration</title><script type="module" crossorigin src="${app}"></script><link rel="stylesheet" crossorigin href="${css}"><link rel="modulepreload" crossorigin href="${lazy}"></head><body><div id="root"></div></body></html>`,
    [app]: `document.querySelector("#root").textContent = "Hydration ${tag} trade liquidity borrow portfolio application rendering for watchdog validation."; import("${lazy}")`,
    [lazy]: `export const release = "${tag}"`,
    [css]: `body{background:#0a1420}`,
  }
}
export function manifest(sha, files) {
  return {
    version: 1,
    repo: "galacticcouncil/hydration-ui",
    branch: "production",
    sha,
    reproducible: true,
    files: Object.fromEntries(
      Object.entries(files).map(([p, s]) => [
        p,
        { sha256: sha256(s), size: Buffer.byteLength(s) },
      ]),
    ),
  }
}
export const A = build("aaaa1111"),
  B = build("bbbb2222"),
  shaA = "a".repeat(40),
  shaB = "b".repeat(40),
  refA = manifest(shaA, A),
  refB = manifest(shaB, B)

// Attacker page: the trusted shell plus an injected script.
export const fakeHtml = (extra = "") =>
  A["/index.html"].replace(
    "</head>",
    `<script>/* drainer */fetch("/collect")</script>${extra}</head>`,
  )
export const html = (body) => ({ type: "text/html; charset=UTF-8", body })

const type = (p) =>
  p.endsWith(".js")
    ? "application/javascript"
    : p.endsWith(".css")
      ? "text/css"
      : p.endsWith(".wasm")
        ? "application/wasm"
        : "text/html; charset=UTF-8"

// Netlify-like origin. Static files come from `deploy.files`; anything missing
// gets the SPA rewrite from apps/main/netlify.toml (`/* -> /index.html 200`).
// `attack(req, url, state)` may override a reply; `state` is per origin, i.e.
// per observer, like an attacker keying on the client address.
export async function site(t, { deploy, attack, onRequest } = {}) {
  const log = [],
    state = { roots: 0 }
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://fixture")
    log.push({ path: url.pathname, headers: { ...req.headers } })
    onRequest?.(url, state)
    const forced = attack?.(req, url, state)
    if (forced) {
      res.writeHead(forced.status || 200, {
        "content-type": forced.type || "text/html; charset=UTF-8",
        "cache-control": "public, max-age=0, must-revalidate",
      })
      res.end(forced.body)
      return
    }
    const p = url.pathname === "/" ? "/index.html" : url.pathname
    const files = deploy.files
    res.writeHead(200, {
      "content-type": files[p] ? type(p) : type(".html"),
      "cache-control": "public, max-age=0, must-revalidate",
    })
    res.end(files[p] ?? files["/index.html"])
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  return { target: `http://127.0.0.1:${server.address().port}`, log, state }
}

export const cfg = (target, extra = {}) => ({
  target,
  timeoutMs: 2000,
  concurrency: 4,
  externalScripts: {},
  ...extra,
})

// Mirrors main.mjs:193-202 (inline there; extracting it would let tests import it).
export const severityOf = (state) =>
  state === "integrity_alert"
    ? "critical"
    : ["down", "degraded", "stale_deployment"].includes(state)
      ? "error"
      : state === "verified"
        ? "info"
        : "warning"

const ids = [
  ["direct", "direct"],
  ["tor-de", "tor"],
  ["tor-us", "tor"],
]
// Coordinator-side state for observer i with fresh public egress, so the
// snapshot judges content, not plumbing (observers.mjs:339-360).
export function observerState(i, { probe, audit, browser }) {
  const [id, kind] = ids[i]
  const at = new Date().toISOString()
  const egress = {
    ip: `1.1.1.${i + 1}`,
    tor: kind === "tor",
    kind,
    checkedAt: at,
  }
  return {
    id,
    kind,
    url: "http://observer.invalid/",
    failures: {},
    failurePaths: {},
    sequence: [],
    raceCount: 0,
    probe: { ...probe, egress },
    audit,
    browser: {
      rootHash: probe.rootHash,
      matchedSha: probe.matchedSha,
      issues: [],
      completedAt: at,
      ...browser,
      egress,
    },
  }
}
// The 30 s quick probe followed by the 5 min full audit, as scheduled.
export async function sample(i, c, references) {
  const probe = await observe(c, references)
  const audit = await observe(c, references, { full: true })
  return observerState(i, { probe, audit })
}

// The aggregation path main.mjs uses: schedule(references) then snapshot().
export function group(states, references, { source, referenceStatus } = {}) {
  // Exercise the same persistent evidence path as the coordinator. A get-only
  // stub cannot detect a payload that disappears before its reference arrives.
  const dir = mkdtempSync(join(tmpdir(), "watchdog-review-"))
  const store = new Store(dir)
  after(() => {
    store.close()
    rmSync(dir, { recursive: true, force: true })
  })
  const g = new ObserverGroup(
    config({ MULTI_NETWORK: "true" }),
    store,
    () => {},
    () => {},
    new Map(),
  )
  g.states = states
  g.schedule(references, source, referenceStatus) // background is a no-op here
  for (const state of states)
    for (const [kind, result] of [
      ["quick", state.probe],
      ["audit", state.audit],
      ["browser", state.browser],
    ])
      if (result) g.record(state, result, kind)
  return g
}
