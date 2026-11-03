// P4: (1) the public dashboard (traefik Host ui-watchdog.play.hydration.cloud,
// no auth) publishes every observer's sampled exit IP -- the allow-list a
// selective-serving attacker needs; (2) an unreachable check.torproject.org
// turns an observer `degraded` -> severity "error" -> Discord mention.
import test from "node:test"
import assert from "node:assert/strict"
import { config } from "../src/config.mjs"
import { ObserverGroup } from "../src/observers.mjs"
import { serve } from "../src/server.mjs"
import { serveObserver } from "../src/worker.mjs"
import { socksFixture } from "./proxy-fixture.mjs"
import { A, refA, severityOf, site } from "./review-fixtures.mjs"

test("P4: dashboard, status and history JSON do not publish observer exit IPs", async (t) => {
  const ips = ["95.217.10.20", "185.220.101.7"]
  const egress = (ip) => ({
    ip,
    tor: true,
    kind: "tor",
    checkedAt: new Date().toISOString(),
  })
  const observers = ips.map((ip, i) => ({
    id: `tor-${i}`,
    kind: "tor",
    state: "verified",
    reasons: [],
    probe: { rootHash: "0".repeat(64), egress: egress(ip) },
    browser: { egress: egress(ip) },
  }))
  // main.mjs:249-258 / 81-93 and the verification_changed event (213-217).
  const status = {
    state: "verified",
    reasons: [],
    target: "https://app.hydration.net",
    observers,
    probe: observers[0].probe,
  }
  const events = [
    {
      id: 1,
      at: "now",
      kind: "verification_changed",
      severity: "info",
      data: {
        summary: "ok",
        observers: observers.map((o) => ({
          id: o.id,
          state: o.state,
          exitIp: o.probe.egress.ip,
        })),
      },
    },
  ]
  const store = { events: () => events, notifications: () => ({ pending: 0 }) }
  const server = serve(
    { port: 0 },
    store,
    () => status,
    () => true,
  )
  await new Promise((r) => server.once("listening", r))
  t.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}`
  for (const path of ["/", "/api/status", "/api/events"]) {
    const body = await (await fetch(base + path)).text()
    for (const ip of ips) assert(!body.includes(ip), `${path} publishes ${ip}`)
  }
})

test(
  "P4: an unreachable egress-check service blocks verification without paging",
  { timeout: 30000 },
  async (t) => {
    // Real worker; its SOCKS gateway reaches the app, but the HTTPS egress check
    // (check.torproject.org) fails its TLS handshake.
    const s = await site(t, { deploy: { files: A } })
    const proxy = await socksFixture(t, Number(new URL(s.target).port))
    const worker = serveObserver(
      {
        ...config({
          ROLE: "observer",
          EGRESS_KIND: "tor",
          PROXY_URL: proxy.url,
          OBSERVER_ID: "tor-de",
        }),
        target: "http://remote.invalid",
        port: 0,
        timeoutMs: 3000,
      },
      {
        allowNetwork: async () => true,
        executablePath: process.env.CHROMIUM_EXECUTABLE,
      },
    )
    await new Promise((r) => worker.once("listening", r))
    t.after(() => {
      worker.closeAllConnections()
      worker.close()
    })
    const c = config({
      OBSERVERS_JSON: JSON.stringify([
        {
          id: "tor-de",
          kind: "tor",
          url: `http://127.0.0.1:${worker.address().port}`,
        },
      ]),
      MIN_DISTINCT_EGRESS: "1",
    })
    const g = new ObserverGroup(
      c,
      { get: () => null },
      () => {},
      () => {},
      new Map(),
    )
    const [st] = g.states
    st.probe = await g.call(
      st,
      "/observe",
      { references: [refA], full: false },
      10000,
    )
    st.audit = await g.call(
      st,
      "/observe",
      { references: [refA], full: true },
      10000,
    )
    st.browser = {
      rootHash: st.probe.rootHash,
      matchedSha: st.probe.matchedSha,
      issues: [],
      completedAt: new Date().toISOString(),
      egress: st.probe.egress,
    }
    assert.equal(
      st.probe.rootHash,
      refA.files["/index.html"].sha256,
      "worker reached the trusted app through SOCKS",
    )
    assert.deepEqual(st.probe.issues, [], "only the egress check failed")
    assert(st.probe.egress.error, "egress check must have failed")
    g.schedule([refA])
    const snap = g.snapshot({ sha: refA.sha, firstSeen: 0 }, true, Date.now())
    assert.equal(
      snap.observers[0].state,
      "unverified",
      JSON.stringify(snap.observers[0].reasons),
    )
    assert.equal(severityOf(snap.assessment.state), "warning")
  },
)
