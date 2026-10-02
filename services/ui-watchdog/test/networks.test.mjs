import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { combineObservers, ObserverGroup } from "../src/observers.mjs"
import { config } from "../src/config.mjs"
import { siteTransport } from "../src/transport.mjs"
import { publicNetworkPolicy, validateEgress } from "../src/network.mjs"
import { nordConnection, wireguardConfig } from "../src/vpn.mjs"
import { sha256 } from "../src/util.mjs"
import { socksFixture } from "./proxy-fixture.mjs"

const sha = "a".repeat(40),
  now = Date.now(),
  at = new Date(now).toISOString()
const entry = (value) => ({ sha256: sha256(value), size: value.length })
function observers() {
  return ["direct", "tor-de", "tor-us"].map((id, i) => {
    const probe = {
      rootHash: sha256("html"),
      matchedSha: sha,
      completedAt: at,
      issues: [],
      observed: { "/index.html": entry("html"), "/app.js": entry("app") },
      egress: { ip: `1.1.1.${i + 1}`, tor: i !== 0, checkedAt: at },
    }
    return {
      id,
      kind: i ? "tor" : "direct",
      state: "verified",
      reasons: [],
      probe,
      audit: { ...probe, full: true },
      browser: { ...probe },
    }
  })
}
const combine = (os) =>
  combineObservers(os, { now, source: { sha, firstSeen: now - 1000000 } })

test("one dissenting path alerts despite a matching majority, even without references", () => {
  const os = observers()
  assert.equal(combine(os).assessment.state, "verified")
  os[2].probe.observed["/app.js"] = entry("injection")
  assert.equal(combine(os).assessment.state, "integrity_alert")
  for (const o of os) {
    o.state = "unverified"
    o.probe.matchedSha = null
  }
  assert.equal(combine(os).assessment.state, "integrity_alert")
  assert.equal(combine(os).findings[0].path, "/app.js")
})

test("full audits compare lazy assets and trusted rollouts receive a bounded grace", () => {
  const os = observers()
  os[0].audit = { ...os[0].audit, observed: { "/lazy.js": entry("a") } }
  os[1].audit = { ...os[1].audit, observed: { "/lazy.js": entry("b") } }
  assert.equal(combine(os).assessment.state, "integrity_alert")
  os[1].state = "deployment_pending"
  os[1].probe.matchedSha = "b".repeat(40)
  assert.equal(
    combineObservers(os, { now, source: { sha, firstSeen: now } }).assessment
      .state,
    "deployment_pending",
  )
  os[1].state = "integrity_alert"
  assert.equal(
    combineObservers(os, { now, source: { sha, firstSeen: now } }).assessment
      .state,
    "integrity_alert",
  )
})

test("missing observers and duplicate HTTP or browser exits cannot pass", () => {
  for (const field of ["probe", "browser"]) {
    const os = observers()
    os[2][field] = { ...os[2][field], egress: os[1][field].egress }
    assert.equal(combine(os).assessment.state, "unverified")
  }
  const os = observers()
  os[1].state = "down"
  os[1].reasons = ["SOCKS unavailable"]
  assert.equal(combine(os).assessment.state, "degraded")
})

test("stale and incorrectly routed samples invalidate previously green observers", () => {
  const g = new ObserverGroup(
    config({ MULTI_NETWORK: "true" }),
    { get: () => null },
    () => {},
    () => {},
    new Map(),
  )
  g.states = observers()
  const snapshot = () =>
    g.snapshot({ sha, firstSeen: now - 1000000 }, true, now).assessment.state
  assert.equal(snapshot(), "verified")
  g.states[1].probe.completedAt = new Date(now - 300000).toISOString()
  assert.equal(snapshot(), "unverified")
  g.states = observers()
  g.states[2].browser = {
    ...g.states[2].browser,
    egress: { ...g.states[2].browser.egress, tor: false },
  }
  assert.equal(snapshot(), "unverified")
  g.states[2].browser.egress.error = "wrong path"
  assert.equal(snapshot(), "degraded")
})

test("network configuration requires proxies and explicitly enables optional providers", () => {
  assert.equal(config({ MULTI_NETWORK: "true" }).observers.length, 3)
  assert.equal(
    config({
      MULTI_NETWORK: "true",
      NORDVPN_REPLICAS: "1",
      WIREGUARD_REPLICAS: "1",
    }).observers.length,
    7,
  )
  for (const env of [
    { ROLE: "observer", EGRESS_KIND: "tor" },
    {
      ROLE: "observer",
      EGRESS_KIND: "proxy",
      PROXY_URL: "socks5://gateway:9050",
    },
    {
      ROLE: "observer",
      EGRESS_KIND: "proxy",
      PROXY_URL: "socks5h://u:secret@gateway:9050",
    },
    { OBSERVERS_JSON: "[null]" },
    { NORDVPN_REPLICAS: "2" },
  ])
    assert.throws(() => config(env))
  assert.throws(() =>
    validateEgress({ egressKind: "tor" }, { IP: "1.1.1.1", IsTor: false }),
  )
  assert.throws(() =>
    validateEgress(
      { expectedExitIp: "1.1.1.2" },
      { IP: "1.1.1.1", IsTor: false },
    ),
  )
})

test("remote DNS policy blocks private literals, local hostnames and credentials", async () => {
  const allow = publicNetworkPolicy({ remoteDns: true })
  for (const url of [
    "https://10.0.0.1",
    "https://[::1]",
    "https://metadata",
    "https://x.local",
    "https://u:password@public.example",
    "http://public.example",
    "https://public.example:8080",
  ])
    assert.equal(await allow(url), false, url)
  assert.equal(await allow("https://app.hydration.net"), true)
})

test("HTTP bodies and remote DNS traverse SOCKS; dead proxies never fall back", async (t) => {
  let hits = 0
  const server = createServer((req, res) => {
    hits++
    res.end(req.url === "/large" ? "x".repeat(100) : "proxy bytes")
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const proxy = await socksFixture(t, server.address().port)
  const send = siteTransport({
    proxyUrl: proxy.url,
    requireProxy: true,
    timeoutMs: 1000,
  })
  assert.equal(
    (await send("http://remote.invalid/app.js")).bytes.toString(),
    "proxy bytes",
  )
  assert.equal(proxy.destinations[0].host, "remote.invalid")
  assert.equal(proxy.destinations[0].type, 3)
  await assert.rejects(send("http://remote.invalid/large", { maxBytes: 20 }))
  proxy.close()
  const before = hits
  await assert.rejects(
    send(`http://127.0.0.1:${server.address().port}`, { timeoutMs: 1000 }),
  )
  assert.equal(hits, before)
  assert.throws(() => siteTransport({ requireProxy: true }))
})

test("SOCKS handshake deadlines are bounded", async (t) => {
  const proxy = await socksFixture(t, 1, { stalled: true })
  const send = siteTransport({ proxyUrl: proxy.url, timeoutMs: 100 })
  const started = Date.now()
  await assert.rejects(send("http://remote.invalid", { timeoutMs: 100 }))
  assert(Date.now() - started < 2000)
})

const privateKey = Buffer.alloc(32, 1).toString("base64"),
  publicKey = Buffer.alloc(32, 2).toString("base64")
test("one Nord account token supplies independent country selections and rotation", async () => {
  const requests = []
  const api = async (url, options) => {
    requests.push({ url, options })
    const u = new URL(url)
    const country =
      u.searchParams.get("filters[country_id]") === "2" ? "US" : "DE"
    const data = u.pathname.endsWith("credentials")
      ? { nordlynx_private_key: privateKey }
      : u.pathname.endsWith("countries")
        ? [
            { id: 1, code: "DE" },
            { id: 2, code: "US" },
          ]
        : [1, 2].map((n) => ({
            hostname: `${country.toLowerCase()}${n}.nordvpn.com`,
            station: `1.1.1.${n}`,
            locations: [{ country: { code: country } }],
            technologies: [
              {
                identifier: "wireguard_udp",
                metadata: [{ name: "public_key", value: publicKey }],
              },
            ],
          }))
    return { status: 200, bytes: Buffer.from(JSON.stringify(data)) }
  }
  const c = { nordToken: "test-account-token", nordCountry: "DE" }
  const first = await nordConnection(c, { api })
  const next = await nordConnection(c, {
    api,
    privateKey: first.privateKey,
    previousHostname: first.hostname,
  })
  assert.notEqual(next.hostname, first.hostname)
  const us = await nordConnection(
    { ...c, nordCountry: "US" },
    { api, privateKey: first.privateKey },
  )
  assert.match(us.hostname, /^us/)
  assert.equal(
    requests.filter((r) => r.options.headers.authorization).length,
    1,
  )
  assert.equal(
    Buffer.from(
      requests[0].options.headers.authorization.slice(6),
      "base64",
    ).toString(),
    "token:test-account-token",
  )
  assert.match(wireguardConfig(first), /BindAddress = 0.0.0.0:9050/)
})

test("WireGuard configuration rejects key, endpoint and newline injection", () => {
  const base = {
    privateKey,
    publicKey,
    endpoint: "vpn.example:51820",
    address: "10.5.0.2/32",
    dns: "1.1.1.1",
  }
  assert.match(wireguardConfig(base), /AllowedIPs = 0.0.0.0\/0, ::\/0/)
  for (const change of [
    { privateKey: "bad" },
    { endpoint: "127.0.0.1:51820" },
    { endpoint: "vpn.example:51820\n[Interface]" },
    { address: "10.0.0.2/32\nDNS=1.1.1.1" },
    { address: "10.0.0.2/32/anything" },
    { dns: "1.1.1.1\n" },
  ])
    assert.throws(() => wireguardConfig({ ...base, ...change }))
})

test("worker identities and claimed source hashes are checked by the coordinator", async (t) => {
  let data = { observerId: "wrong", kind: "direct", result: {} }
  const server = createServer((req, res) => {
    req.resume()
    res.end(JSON.stringify(data))
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const c = config({}),
    s = {
      id: "direct",
      kind: "direct",
      url: `http://127.0.0.1:${server.address().port}`,
    }
  const group = new ObserverGroup(
    c,
    { get: () => null },
    () => {},
    () => {},
    new Map(),
  )
  await assert.rejects(
    group.call(s, "/observe", { references: [] }, 1000),
    /identity/,
  )
  data = {
    observerId: "direct",
    kind: "direct",
    result: observers()[0].probe,
  }
  await assert.rejects(
    group.call(s, "/observe", { references: [] }, 1000),
    /unknown reference/,
  )
})
