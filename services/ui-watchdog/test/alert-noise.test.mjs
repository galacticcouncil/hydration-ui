// tor observers produced error posts from slow circuits, not from content
import test from "node:test"
import assert from "node:assert/strict"
import { setTimeout as sleep } from "node:timers/promises"
import { config } from "../src/config.mjs"
import { payload } from "../src/discord.mjs"
import { ObserverGroup } from "../src/observers.mjs"
import { isRecovery } from "../src/policy.mjs"
import { observe } from "../src/scan.mjs"
import { sha256 } from "../src/util.mjs"

const sha = "a".repeat(40)
const html =
  '<!doctype html><div id="root"></div><script type="module" src="/app.js"></script>'
const files = {
  "/index.html": html,
  "/app.js": 'import("/lazy.js")',
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [
      `/chunk-${i}.js`,
      `export const n=${i}`,
    ]),
  ),
}
const reference = {
  sha,
  files: Object.fromEntries(
    Object.entries(files).map(([p, b]) => [
      p,
      { sha256: sha256(b), size: Buffer.byteLength(b) },
    ]),
  ),
}

// answers like the chromium transport; `serve(path, attempt)` may throw or override the body
function transport(serve = () => undefined) {
  const attempts = {}
  const request = async (url) => {
    const path = url.pathname === "/" ? "/index.html" : url.pathname
    attempts[path] = (attempts[path] || 0) + 1
    const body = (await serve(path, attempts[path])) ?? files[path]
    return {
      status: 200,
      headers: new Headers({
        "content-type": path.endsWith(".js") ? "text/javascript" : "text/html",
      }),
      bytes: Buffer.from(body),
    }
  }
  return { attempts, request }
}
const audit = (request, extra = {}) =>
  observe(
    {
      target: "https://app.test",
      concurrency: 2,
      externalScripts: {},
      siteRequest: request,
      ...extra,
    },
    [reference],
    { full: true },
  )
const kinds = (r) => r.issues.map((i) => `${i.kind} ${i.path}`)

test("a transient fetch error is retried once instead of failing the file", async () => {
  const t = transport((path, n) => {
    if (path === "/chunk-3.js" && n === 1) throw new Error("HTTP 403")
  })
  const r = await audit(t.request)
  assert.deepEqual(kinds(r), [])
  assert.equal(
    r.observed["/chunk-3.js"].sha256,
    reference.files["/chunk-3.js"].sha256,
  )
  assert.equal(t.attempts["/chunk-3.js"], 2)
})

test("a file that fails twice is reported once as fetch-failed", async () => {
  const t = transport((path) => {
    if (path === "/chunk-3.js") throw new Error("HTTP 403")
  })
  const r = await audit(t.request)
  assert.deepEqual(kinds(r), ["fetch-failed /chunk-3.js"])
  assert.equal(t.attempts["/chunk-3.js"], 2)
})

test("a hash mismatch is reported without a retry", async () => {
  const t = transport((path) =>
    path === "/chunk-5.js" ? "export const drain=1" : undefined,
  )
  const r = await audit(t.request)
  assert.deepEqual(kinds(r), ["hash-mismatch /chunk-5.js"])
  assert.equal(t.attempts["/chunk-5.js"], 1)
})

test("an exhausted scan budget is one audit-incomplete issue, not one per file", async () => {
  const t = transport(async (path) => {
    if (path !== "/index.html") await sleep(30)
  })
  const r = await audit(t.request, { concurrency: 1, auditBudgetMs: 50 })
  const incomplete = r.issues.filter((i) => i.kind === "audit-incomplete")
  assert.equal(incomplete.length, 1, JSON.stringify(kinds(r)))
  assert.match(incomplete[0].message, /ran out with \d+ of 9 files unchecked/)
  assert.equal(
    r.issues.filter((i) => i.kind === "fetch-failed").length,
    0,
    "skipped files must not be listed one by one",
  )
})

test("proxied observers get a longer default scan budget", () => {
  assert.equal(config({}).auditBudgetMs, 120000)
  assert.equal(
    config({
      ROLE: "observer",
      EGRESS_KIND: "tor",
      PROXY_URL: "socks5h://tor:9050",
    }).auditBudgetMs,
    240000,
  )
})

test("an all-clear follows a posted error even after an intervening warning", () => {
  assert.equal(isRecovery(true, "unverified", true), true)
  assert.equal(isRecovery(true, "unverified", false), false)
  assert.equal(isRecovery(true, "degraded", false), true)
  assert.equal(isRecovery(false, "degraded", true), false)
})

test("one noisy observer cannot push another observer's findings out of the post", () => {
  const now = Date.now(),
    at = new Date(now).toISOString()
  const g = new ObserverGroup(
    config({ MULTI_NETWORK: "true" }),
    { get: () => null },
    () => {},
    () => {},
    new Map(),
  )
  const result = (issues = []) => ({
    rootHash: sha256(html),
    matchedSha: sha,
    completedAt: at,
    issues,
    observed: {},
  })
  g.states = ["direct", "tor-de", "tor-us"].map((id, i) => ({
    id,
    kind: i ? "tor" : "direct",
    failures: {},
    probe: result(),
    audit: result(
      id === "tor-de"
        ? Array.from({ length: 97 }, (_, n) => ({
            kind: "fetch-failed",
            path: `/chunk-${n}.js`,
            message: "HTTP 403",
          }))
        : id === "direct"
          ? [{ kind: "hash-mismatch", path: "/app.js" }]
          : [],
    ),
    browser: result(
      id === "tor-us"
        ? [{ kind: "fetch-failed", path: "/", message: "HTTP 403" }]
        : [],
    ),
  }))
  const { findings } = g.snapshot({ sha, firstSeen: now - 1000000 }, true, now)
  assert.equal(
    findings[0].kind,
    "hash-mismatch",
    "integrity findings come first",
  )
  assert(
    findings.some((f) => f.observer === "tor-us"),
    "tor-us's own reason must survive the cap",
  )
  const post = payload(
    {
      id: 1,
      kind: "verification_changed",
      severity: "error",
      at,
      data: { summary: "tor-us: Asset or browser checks failed", findings },
    },
    { target: "https://app.test", repo: "galacticcouncil/hydration-ui" },
  )
  const shown = post.embeds[0].fields
    .find((f) => f.name === "Findings")
    .value.replace(/\\/g, "")
  assert.match(shown, /^1× direct: hash-mismatch/)
  assert.match(shown, /30× tor-de: fetch-failed \(HTTP 403\)/)
  assert.match(shown, /1× tor-us: fetch-failed \(HTTP 403\)/)
})
