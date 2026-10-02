import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { observe, assess } from "../src/scan.mjs"
import {
  incidentFingerprint,
  headerIssues,
  shouldNotify,
  dailyHeartbeatDue,
  reconcileEvidence,
} from "../src/policy.mjs"
import { Store } from "../src/store.mjs"
import { payload, deliver } from "../src/discord.mjs"
import { publicStatus, publicEvents, dashboard, serve } from "../src/server.mjs"
import { checkEgress } from "../src/network.mjs"
import { ObserverGroup, combineObservers } from "../src/observers.mjs"
import { sha256 } from "../src/util.mjs"

const sha = "a".repeat(40),
  older = "b".repeat(40)
const html = '<div id="root"></div><script src="/app.js"></script>'
const files = { "/index.html": html, "/app.js": "trusted()" }
const reference = (source = sha, document = html) => ({
  version: 1,
  reproducible: true,
  sha: source,
  files: Object.fromEntries(
    Object.entries({ ...files, "/index.html": document }).map(([p, s]) => [
      p,
      { sha256: sha256(s), size: Buffer.byteLength(s) },
    ]),
  ),
})
const ref = reference(),
  now = Date.now(),
  at = new Date(now).toISOString()
const clean = {
  rootHash: ref.files["/index.html"].sha256,
  matchedSha: sha,
  issues: [],
  full: true,
  completedAt: at,
}
const mismatch = {
  kind: "hash-mismatch",
  path: "/app.js",
  actual: sha256("evil"),
  referenceSha: sha,
}
async function database(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "review-")),
    store = new Store(dir)
  t.after(async () => {
    store.close()
    await rm(dir, { recursive: true, force: true })
  })
  return store
}

for (const [name, pages] of Object.entries({
  "fake then real": [html + "evil", html],
  "random nonce in fake page": [html + "nonce1", html + "nonce2"],
  "real then fake": [html, html + "evil"],
}))
  test(`racing: ${name} is exactly integrity_alert`, async () => {
    let read = 0
    const c = {
      target: "https://app.test",
      concurrency: 2,
      externalScripts: {},
      siteRequest: async (u) => ({
        status: 200,
        headers: new Headers({
          "content-type":
            u.pathname === "/" ? "text/html" : "application/javascript",
        }),
        bytes: Buffer.from(
          u.pathname === "/" ? pages[Math.min(read++, 1)] : files[u.pathname],
        ),
      }),
    }
    const probe = await observe(c, [ref])
    assert.equal(probe.documents.length, 2)
    assert.equal(assess({ probe }).state, "integrity_alert")
  })

test("a racing audit cannot mask a probe mismatch, including a stale audit", () => {
  assert.equal(
    assess({
      probe: { ...clean, issues: [mismatch] },
      audit: { ...clean, racing: true, completedAt: "2000-01-01" },
    }).state,
    "integrity_alert",
  )
})
for (const kind of ["audit", "browser"])
  test(`${kind} evidence survives a moved root hash`, () => {
    assert.equal(
      assess({
        probe: { ...clean, rootHash: "new" },
        [kind]: { ...clean, issues: [mismatch] },
      }).state,
      "integrity_alert",
    )
  })
test("two trusted documents never excuse a modified chunk", () => {
  assert.equal(
    assess({
      probe: {
        ...clean,
        racing: true,
        issues: [mismatch],
        documents: [{ matchedSha: sha }, { matchedSha: older }],
      },
    }).state,
    "integrity_alert",
  )
  assert.equal(
    assess({
      probe: { ...clean, racing: true },
      source: { sha, firstSeen: now },
    }).state,
    "unverified",
  )
})
test("sustained racing escalates with zero references; stable unarmed monitoring is explicit", () => {
  assert.equal(
    assess({
      probe: { ...clean, matchedSha: null, racing: true },
      referenceCount: 0,
      raceCount: 3,
    }).state,
    "integrity_alert",
  )
  assert.equal(
    assess({ probe: { ...clean, matchedSha: null }, referenceCount: 0 }).state,
    "protection_inactive",
  )
})
test("flapping trusted releases is critical", () => {
  assert.equal(
    assess({ probe: clean, flapping: true }).state,
    "integrity_alert",
  )
})
test("unknown HTML waits only for an actual active build, then becomes critical", () => {
  const probe = {
    ...clean,
    matchedSha: null,
    issues: [{ kind: "hash-mismatch", path: "/", untrustedHtml: true }],
  }
  const args = {
    probe,
    source: { sha, firstSeen: now },
    referenceStatus: { state: "building", sha },
    now,
  }
  assert.equal(assess(args).state, "reference_pending")
  assert.equal(assess({ ...args, now: now + 1201000 }).state, "integrity_alert")
  assert.equal(
    assess({ ...args, referenceStatus: { state: "ready", sha } }).state,
    "integrity_alert",
  )
  assert.equal(
    assess({ ...args, referenceStatus: { state: "failed", sha } }).state,
    "reference_failed",
  )
  for (const state of [
    "building",
    "failed",
    "missing",
    "error",
    "unconfigured",
  ])
    assert.equal(
      assess({
        ...args,
        referenceAvailable: true,
        referenceStatus: { state, sha },
      }).state,
      "integrity_alert",
      "a pipeline error or stale build status cannot excuse bytes once the expected reference exists",
    )
})
test("every pending HTML hash and asset is compared retrospectively", async (t) => {
  const s = await database(t)
  s.retainPending(sha, "direct", {
    documents: [{ sha256: sha256(html) }, { sha256: sha256("malicious") }],
    observed: { "/app.js": { sha256: sha256("evil"), size: 4 } },
  })
  const findings = s.resolvePending([ref])
  assert.equal(findings.length, 2)
  assert(findings.every((f) => f.retrospective))
  assert.equal(s.get("retrospectiveIssues").length, 2)
  assert.equal(s.resolvePending([ref]).length, 0)
})
test("incident keys ignore injected nonces, changing paths, and extra locations", () => {
  const a = incidentFingerprint(
    { state: "integrity_alert", reasons: ["nonce1"] },
    [{ id: "direct", state: "integrity_alert", rootHash: "one" }],
  )
  const b = incidentFingerprint(
    { state: "integrity_alert", reasons: ["nonce2"] },
    [{ id: "direct", state: "integrity_alert", rootHash: "two" }],
  )
  assert.equal(a, b)
})
test("staggered trusted rollout does not page while fresh audits catch up", () => {
  const os = [sha, older].map((s, i) => ({
    id: String(i),
    state: "unverified",
    reasons: [],
    probe: {
      ...clean,
      matchedSha: s,
      observed: { "/index.html": { sha256: s } },
    },
  }))
  assert.equal(
    combineObservers(os, { source: { sha, firstSeen: now }, now }).assessment
      .state,
    "deployment_pending",
  )
})
test("older references remain available for rollbacks after 30 releases", async (t) => {
  const s = await database(t)
  for (let i = 0; i < 35; i++)
    s.addReference(reference(i.toString(16).padStart(40, "0")), {})
  assert.equal(s.references().length, 35)
})
test("header policy detects cache or CSP changes with identical content", () => {
  const policy = {
    default: {
      "cache-control": "public,max-age=0,must-revalidate",
      "content-security-policy": null,
    },
  }
  assert.equal(
    headerIssues(
      "/app.js",
      { "cache-control": "public, max-age=0, must-revalidate" },
      policy,
    ).length,
    0,
  )
  assert.equal(
    headerIssues(
      "/app.js",
      { "cache-control": "max-age=31536000,immutable" },
      policy,
    )[0].kind,
    "header-policy",
  )
})
test("only critical events mention; attacker markdown is escaped", () => {
  const e = {
    id: 1,
    severity: "error",
    kind: "check",
    data: {
      summary: "[fake](https://evil.test)",
      paths: ["/[fake](https://evil.test)"],
    },
  }
  const p = payload(e, { mention: "@everyone" })
  assert.equal(p.content, undefined)
  assert(p.embeds[0].fields[0].value.includes("\\[fake\\]\\("))
  assert.equal(
    payload({ ...e, severity: "critical" }, { mention: "@here" }).content,
    "@here",
  )
})
test("Discord 404 becomes terminal and critical deliveries are never behind warnings", async (t) => {
  const s = await database(t)
  s.event("warning", "warning", {})
  const critical = s.event("attack", "critical", {})
  assert.equal(s.pending()[0].id, critical)
  await deliver(
    s,
    { webhook: "https://discord.com/api/webhooks/1/test" },
    async () => ({ status: 404, bytes: Buffer.from("{}") }),
  )
  assert.equal(s.pending().length, 0)
  assert(s.get("deliveryFailure"))
})
test("public surfaces never expose persisted IPs, timing, or armed state", () => {
  const status = {
    state: "unverified",
    observers: [{ probe: { egress: { ip: "65.108.108.7" }, at } }],
    notifications: { configured: false },
  }
  const events = [
    {
      kind: "change",
      severity: "warning",
      at,
      data: { exitIp: "65.108.108.7" },
    },
  ]
  for (const text of [
    JSON.stringify(publicStatus(status)),
    JSON.stringify(publicEvents(events)),
    dashboard(status, events),
  ]) {
    assert(!text.includes("65.108.108.7"))
    assert(!text.includes(at))
    assert(!text.includes("configured"))
  }
})
test("status and event endpoints require authentication, including old event history", async (t) => {
  const s = await database(t)
  const server = serve(
    { port: 0, adminToken: "private-test-token" },
    s,
    () => ({ observers: [{ ip: "1.1.1.1" }] }),
    () => true,
  )
  await new Promise((r) => server.once("listening", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  for (const route of ["/", "/api/status", "/api/events"]) {
    const r = await fetch(`http://127.0.0.1:${server.address().port}${route}`)
    assert.equal(r.status, 401)
    assert(!(await r.text()).includes("1.1.1.1"))
  }
})
test("an egress oracle outage uses a second source without inventing Tor membership", async () => {
  let calls = 0
  const result = await checkEgress({ egressKind: "tor" }, async () =>
    ++calls === 1
      ? { status: 503 }
      : { status: 200, bytes: Buffer.from('{"ip":"1.1.1.1"}') },
  )
  assert.equal(calls, 2)
  assert.equal(result.tor, null)
  assert(result.membershipUnverified)
})
test("one transient observer failure is unverified; three consecutive failures are degraded", async (t) => {
  const s = await database(t),
    c = {
      observers: [{ id: "direct", kind: "direct" }],
      failureThreshold: 3,
      browserSeconds: 300,
      fullSeconds: 300,
    }
  const group = new ObserverGroup(
    c,
    s,
    () => {},
    () => {},
    new Map(),
  )
  group.states[0].probe = { ...clean, error: "Transient error" }
  group.states[0].failures.quick = 1
  assert.equal(group.snapshot({ sha }, true).assessment.state, "unverified")
  group.states[0].failures.quick = 3
  assert.equal(group.snapshot({ sha }, true).assessment.state, "degraded")
})

test("an hour of changing payloads and observer sets sends one critical incident", () => {
  let previous = { state: "verified", fingerprint: "" },
    notices = 0
  for (let i = 0; i < 3600; i += 5) {
    const assessment = {
      state: i % 60 === 0 ? "unverified" : "integrity_alert",
      reasons: [String(i)],
    }
    const observers = [
      {
        id: i % 2 ? "tor" : "direct",
        state: assessment.state,
        rootHash: String(i),
      },
    ]
    if (shouldNotify(assessment, observers, previous, now + i * 1000, 0)) {
      if (assessment.state === "integrity_alert") notices++
      previous = {
        state: assessment.state,
        fingerprint: incidentFingerprint(assessment, observers),
      }
    }
  }
  assert.equal(notices, 1)
  assert.equal(
    shouldNotify({ state: "verified" }, [], previous, now + 60000, now + 30000),
    false,
  )
  assert.equal(
    shouldNotify({ state: "verified" }, [], previous, now + 90000, now + 30000),
    true,
  )
})
test("verified operation emits a heartbeat at 24 hours, never a false verified heartbeat", () => {
  assert.equal(dailyHeartbeatDue("verified", now, now + 86399999), false)
  assert.equal(dailyHeartbeatDue("verified", now, now + 86400000), true)
  assert.equal(
    dailyHeartbeatDue("protection_inactive", now, now + 86400000),
    false,
  )
})

test("jobs finishing after reference ingestion still validate every captured asset", () => {
  const result = {
    rootHash: ref.files["/index.html"].sha256,
    matchedSha: null,
    issues: [
      {
        kind: "hash-mismatch",
        untrustedHtml: true,
        actual: ref.files["/index.html"].sha256,
      },
    ],
    observed: { "/app.js": { sha256: sha256("evil"), size: 4 } },
  }
  reconcileEvidence(result, [ref])
  assert.equal(result.matchedSha, sha)
  assert.equal(result.issues.length, 1)
  assert.equal(assess({ probe: result }).state, "integrity_alert")
})

test("new external origins produce one warning without failing rendering checks", async (t) => {
  const store = await database(t),
    events = []
  const group = new ObserverGroup(
    { observers: [{ id: "direct" }] },
    store,
    (...args) => events.push(args),
    () => {},
    new Map(),
  )
  const result = {
    ...clean,
    issues: [{ kind: "external-origin", path: "https://new.example.org" }],
  }
  group.record(group.states[0], result, "browser")
  group.record(group.states[0], result, "browser")
  assert.equal(events.length, 1)
  assert.equal(events[0][0], "external_origin")
  assert.equal(events[0][1], "warning")
  assert.equal(group.states[0].failures.browser, 0)
})
