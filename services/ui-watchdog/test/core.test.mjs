import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { zipSync, strToU8 } from "fflate"
import { config } from "../src/config.mjs"
import { publicAddress } from "../src/browser.mjs"
import { payload, deliver } from "../src/discord.mjs"
import { unpackReference, verificationArgs, GitHub } from "../src/github.mjs"
import { validateManifest } from "../src/manifest.mjs"
import { observe, assess, htmlResources } from "../src/scan.mjs"
import { dashboard } from "../src/server.mjs"
import { Store } from "../src/store.mjs"
import { sha256, safeError, request } from "../src/util.mjs"

const sha = "a".repeat(40),
  oldSha = "b".repeat(40)
const html =
  '<!doctype html><div id="root"></div><script type="module" src="/app.js"></script>'
const assets = {
  "/index.html": html,
  "/app.js": 'import("/lazy.js")',
  "/lazy.js": "export const value = 1",
}
const manifest = () => ({
  version: 1,
  repo: "galacticcouncil/hydration-ui",
  branch: "production",
  sha,
  reproducible: true,
  files: Object.fromEntries(
    Object.entries(assets).map(([p, s]) => [
      p,
      { sha256: sha256(s), size: Buffer.byteLength(s) },
    ]),
  ),
})

async function fixture(t, files = { ...assets }) {
  let requests = 0
  const server = createServer((req, res) => {
    requests++
    const p = req.url === "/" ? "/index.html" : req.url
    const value = files[p]
    if (value === undefined) {
      res.writeHead(404).end("missing")
      return
    }
    res.setHeader(
      "content-type",
      p.endsWith(".html") ? "text/html" : "application/javascript",
    )
    res.end(typeof value === "function" ? value(requests) : value)
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  return {
    files,
    c: {
      target: `http://127.0.0.1:${server.address().port}`,
      timeoutMs: 1000,
      concurrency: 2,
      externalScripts: {},
    },
  }
}

test("complete audit matches every file, not merely the HTML/commit label", async (t) => {
  const { c } = await fixture(t)
  const r = await observe(c, [manifest()], { full: true })
  assert.equal(r.matchedSha, sha)
  assert.equal(r.filesChecked, 3)
  assert.deepEqual(r.issues, [])
  assert.equal(r.racing, false)
})

test("injected HTML never becomes an accepted baseline", async (t) => {
  const { c, files } = await fixture(t)
  files["/index.html"] += '<script>fetch("/steal")</script>'
  const r = await observe(c, [manifest()], { full: true })
  assert.equal(r.matchedSha, null)
  assert.equal(assess({ probe: r }).state, "integrity_alert")
})

test("same-name lazy chunk modification is caught by full verification", async (t) => {
  const { c, files } = await fixture(t)
  files["/lazy.js"] = "globalThis.malicious = true"
  const light = await observe(c, [manifest()])
  assert.deepEqual(light.issues, [])
  const full = await observe(c, [manifest()], { full: true })
  assert.equal(full.issues[0].kind, "hash-mismatch")
  assert.equal(full.issues[0].path, "/lazy.js")
})

test("missing assets and deployment races cannot receive a verified result", async (t) => {
  const { c, files } = await fixture(t)
  delete files["/lazy.js"]
  let reads = 0
  files["/index.html"] = () =>
    ++reads === 1 ? html : html + "<!-- newer release -->"
  const r = await observe(c, [manifest()], { full: true })
  assert(r.issues.some((x) => x.kind === "fetch-failed"))
  assert(r.racing)
  assert.notEqual(assess({ probe: r }).state, "verified")
})

test("rollout grace applies only to an intact known release, survives restart timestamps", () => {
  const now = Date.now(),
    at = new Date(now).toISOString()
  const probe = { matchedSha: oldSha, rootHash: "c", issues: [] }
  const audit = { ...probe, full: true, completedAt: at }
  const browser = { ...probe, completedAt: at }
  const args = {
    probe,
    audit,
    browser,
    source: { sha, firstSeen: now - 1000 },
    now,
  }
  assert.equal(assess(args).state, "deployment_pending")
  assert.equal(assess({ ...args, now: now + 901000 }).state, "stale_deployment")
  assert.equal(
    assess({
      ...args,
      probe: { ...probe, issues: [{ kind: "hash-mismatch" }] },
    }).state,
    "integrity_alert",
  )
  assert.equal(assess({ ...args, source: { sha: oldSha } }).state, "verified")
  assert.equal(
    assess({ ...args, source: { sha: oldSha }, sourceFresh: false }).state,
    "unverified",
  )
  assert.equal(
    assess({ ...args, source: { sha: oldSha }, browser: null }).state,
    "unverified",
  )
})

test("old green browser results and asset audits cannot verify a new release", () => {
  const probe = { matchedSha: sha, rootHash: "new", issues: [] }
  const old = {
    matchedSha: sha,
    rootHash: "old",
    issues: [],
    full: true,
    completedAt: new Date().toISOString(),
  }
  assert.equal(
    assess({ probe, audit: old, browser: old, source: { sha } }).state,
    "unverified",
  )
})

test("manifest validation rejects wrong sources and unsafe file paths", () => {
  assert.equal(
    validateManifest(manifest(), { repo: manifest().repo, sha }).sha,
    sha,
  )
  for (const p of [
    "//evil.test/x",
    "/../secret",
    "/x%2fy",
    "/x?key=secret",
    "/x\\y",
  ]) {
    const m = manifest()
    m.files[p] = m.files["/app.js"]
    assert.throws(() => validateManifest(m))
  }
  assert.throws(() => validateManifest(manifest(), { sha: oldSha }))
  assert.throws(() => validateManifest({ ...manifest(), reproducible: false }))
})

test("archives accept only the manifest and signature with bounded decompression", () => {
  const good = {
    "reference.json": strToU8(JSON.stringify(manifest())),
    "reference.sigstore.json": strToU8("{}"),
  }
  assert.equal(Object.keys(unpackReference(zipSync(good))).length, 2)
  assert.throws(() =>
    unpackReference(zipSync({ ...good, "../../escape": strToU8("x") })),
  )
  assert.throws(() =>
    unpackReference(
      zipSync({ ...good, "reference.json": new Uint8Array(9 * 1024 * 1024) }),
    ),
  )
})

test("attestation policy binds repository, workflow, production ref, SHA, hosted runner", () => {
  const args = verificationArgs(
    {
      repo: manifest().repo,
      branch: "production",
      workflow: "ui-watchdog-reference.yml",
    },
    "m",
    "s",
    sha,
  )
  for (const [flag, value] of [
    ["--source-ref", "refs/heads/production"],
    ["--source-digest", sha],
    [
      "--signer-workflow",
      `${manifest().repo}/.github/workflows/ui-watchdog-reference.yml`,
    ],
  ])
    assert.equal(args[args.indexOf(flag) + 1], value)
  assert(args.includes("--deny-self-hosted-runners"))
})

test("reference discovery is explicitly unconfigured without a token", async () => {
  const g = new GitHub({ token: "" })
  assert.equal((await g.references({})).state, "unconfigured")
})

test("HTML parsing handles attribute order and external scripts", () => {
  const r = htmlResources(
    '<script src="/a.js" type="module"></script><script src="https://evil.test/a.js"></script><link href="/x.css" rel="stylesheet">',
    "https://app.test",
  )
  assert.deepEqual(r.quick, ["/a.js", "/x.css"])
  assert.deepEqual(r.external, ["https://evil.test/a.js"])
})

test("state, incident history, and notification retries survive restart", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "watchdog-test-"))
  t.after(() => rm(dir, { recursive: true, force: true }))
  let s = new Store(dir)
  s.set("source", { sha, firstSeen: 123 })
  s.addReference(manifest(), { verifiedAt: "now" })
  const id = s.event("integrity_alert", "critical", {
    summary: "hash mismatch",
  })
  s.retry(id, 0, "HTTP 429")
  s.close()
  s = new Store(dir)
  t.after(() => s.close())
  assert.equal(s.get("source").firstSeen, 123)
  assert.equal(s.references()[0].sha, sha)
  assert.equal(s.pending()[0].attempts, 1)
  assert.equal(s.events()[0].data.summary, "hash mismatch")
  s.delivered(id)
  assert.equal(s.pending().length, 0)
})

test("Discord mention policy never enables mentions from commit messages", () => {
  const e = {
    id: 3,
    kind: "integrity_alert",
    severity: "critical",
    at: new Date().toISOString(),
    data: { summary: "@everyone injection" },
  }
  const p = payload(e, { mention: "<@&12345>", target: "https://app.test" })
  assert.equal(p.content, "<@&12345>")
  assert.deepEqual(p.allowed_mentions, {
    parse: [],
    users: [],
    roles: ["12345"],
  })
  assert.equal(
    payload({ ...e, severity: "info" }, { mention: "@everyone" }).content,
    undefined,
  )
})

test("Discord rate limits preserve delivery and successful retry acknowledges it", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "watchdog-discord-"))
  const s = new Store(dir)
  t.after(async () => {
    s.close()
    await rm(dir, { recursive: true, force: true })
  })
  let count = 0
  const server = createServer((req, res) => {
    req.resume()
    if (++count === 1) res.writeHead(429).end('{"retry_after":1}')
    else res.writeHead(200).end('{"id":"123"}')
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  s.event("check", "info", { summary: "drill" })
  const c = {
    webhook: `http://127.0.0.1:${server.address().port}/`,
    timeoutMs: 1000,
    mention: "",
    target: "https://app.test",
  }
  await deliver(s, c)
  assert.equal(s.notifications().pending, 1)
  assert.equal(s.notifications().maxAttempts, 1)
  s.db.exec("UPDATE outbox SET next_at=0")
  await deliver(s, c)
  assert.equal(s.notifications().pending, 0)
})

test("private network and metadata endpoints are blocked by the browser policy", () => {
  for (const ip of [
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.0.1",
    "100.64.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fe80::1",
    "fc00::1",
  ])
    assert.equal(publicAddress(ip), false, ip)
  assert.equal(publicAddress("1.1.1.1"), true)
  assert.equal(publicAddress("2606:4700:4700::1111"), true)
})

test("dashboard escapes untrusted changelog text and errors redact token URLs", () => {
  const page = dashboard(
    { state: "unverified", reasons: ["<script>alert(1)</script>"] },
    [],
  )
  assert(!page.includes("<script>alert"))
  assert(page.includes("&lt;script&gt;"))
  assert(
    !safeError(
      new Error(
        "failed https://discord.com/api/webhooks/123/secret github_pat_secret",
      ),
    ).includes("secret"),
  )
})

test("configuration rejects invalid secrets and URL credentials", () => {
  assert.equal(config({}).pollSeconds, 30)
  assert.throws(() => config({ TARGET_URL: "https://user:secret@app.test" }))
  assert.throws(() =>
    config({ DISCORD_WEBHOOK_URL: "https://evil.test/secret" }),
  )
  assert.throws(() => config({ POLL_SECONDS: "-1" }))
})

test("HTTP deadlines cover stalled bodies and response sizes are bounded", async (t) => {
  const server = createServer((req, res) => {
    res.writeHead(200)
    res.write("hello")
    if (req.url === "/large") res.end("x".repeat(100))
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const url = `http://127.0.0.1:${server.address().port}`
  await assert.rejects(request(url, { timeoutMs: 50 }))
  await assert.rejects(request(url + "/large", { maxBytes: 20 }))
})
