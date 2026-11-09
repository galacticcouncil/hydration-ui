// Round 2: egress mismatches are swallowed. checkEgress (src/network.mjs:11-39)
// catches validateEgress' definitive answers (network.mjs:117-122) and asks
// ipify instead, and ObserverGroup.snapshot (src/observers.mjs:496-515) keeps a
// misrouted or pinned-IP-mismatched observer "unverified" forever, unnoticed.
// Fails at e29022890 + fix-n1 by design.
import test from "node:test"
import assert from "node:assert/strict"
import { config } from "../src/config.mjs"
import { checkEgress } from "../src/network.mjs"
import { ObserverGroup } from "../src/observers.mjs"
import { sha256 } from "../src/util.mjs"
import { severityOf } from "./review-fixtures.mjs"

const json = (value) => ({
  status: 200,
  bytes: Buffer.from(JSON.stringify(value)),
})
// Records every oracle the check consults; answers per URL host.
function oracles(answers) {
  const asked = []
  const transport = async (url) => {
    const host = new URL(url).hostname
    asked.push(host)
    return answers[host]
  }
  return { asked, transport }
}

test("a proxy exit that is not EXPECTED_EXIT_IP fails without asking the fallback oracle", async () => {
  const { asked, transport } = oracles({
    "check.torproject.org": json({ IP: "5.6.7.8", IsTor: false }),
    "api.ipify.org": json({ ip: "5.6.7.8" }),
  })
  await assert.rejects(
    checkEgress({ egressKind: "proxy", expectedExitIp: "1.2.3.4" }, transport),
    /EXPECTED_EXIT_IP/,
    "a pinned-exit mismatch must be reported as an EXPECTED_EXIT_IP mismatch, not as a generic fallback failure",
  )
  assert.deepEqual(
    asked,
    ["check.torproject.org"],
    "the fallback oracle was consulted after a definitive EXPECTED_EXIT_IP mismatch",
  )
})

test("a tor observer whose exit is not Tor fails instead of passing as membership-unverified", async () => {
  const { asked, transport } = oracles({
    "check.torproject.org": json({ IP: "5.6.7.8", IsTor: false }),
    "api.ipify.org": json({ ip: "5.6.7.8" }),
  })
  await assert.rejects(
    checkEgress({ egressKind: "tor" }, transport),
    /configured network path/,
    "check.torproject.org said IsTor:false for a tor observer, but the check succeeded via the fallback",
  )
  assert.deepEqual(
    asked,
    ["check.torproject.org"],
    "the fallback oracle was consulted after a definitive IsTor mismatch",
  )
})

test("an oracle outage still falls back to ipify without inventing Tor membership", async () => {
  const { asked, transport } = oracles({
    "check.torproject.org": { status: 503, bytes: Buffer.alloc(0) },
    "api.ipify.org": json({ ip: "5.6.7.8" }),
  })
  const result = await checkEgress({ egressKind: "tor" }, transport)
  assert.deepEqual(asked, ["check.torproject.org", "api.ipify.org"])
  assert.equal(result.ip, "5.6.7.8")
  assert.equal(result.tor, null, "ipify cannot confirm Tor membership")
  assert(
    result.membershipUnverified,
    "the result must say membership is unverified",
  )
})

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
      probe,
      audit: { ...probe, full: true },
      browser: { ...probe },
    }
  })
}
function snapshots(threshold) {
  const g = new ObserverGroup(
    config({ MULTI_NETWORK: "true", FAILURE_THRESHOLD: String(threshold) }),
    { get: () => null },
    () => {},
    () => {},
    new Map(),
  )
  g.states = observers()
  const snapshot = () => {
    const s = g.snapshot({ sha, firstSeen: now - 1000000 }, true, now)
    return { state: s.assessment.state, observer: s.observers[1].state }
  }
  // Each call is one new egress record from the tor-de worker.
  let n = 0
  const egress = (value) => {
    const checkedAt = new Date(now - 1000 + ++n).toISOString()
    g.states[1].probe = {
      ...g.states[1].probe,
      egress: { kind: "tor", ...value, checkedAt },
    }
  }
  return { g, snapshot, egress }
}
const misrouted = {
  error: "Observed egress does not match the configured network path",
  mismatch: true,
}
const outage = { error: "Egress oracle unavailable" }

for (const threshold of [3, 5]) {
  test(`an egress mismatch degrades the observer after ${threshold} consecutive records`, () => {
    const { g, snapshot, egress } = snapshots(threshold)
    assert.equal(g.c.failureThreshold, threshold)
    assert.equal(snapshot().state, "verified", "fixture must start verified")
    for (let i = 1; i < threshold; i++) {
      egress(misrouted)
      assert.equal(
        snapshot().observer,
        "unverified",
        `mismatch ${i} of ${threshold} must only be unverified`,
      )
      assert.equal(
        snapshot().observer,
        "unverified",
        "re-reading the same egress record must not count it again",
      )
    }
    egress(misrouted)
    const { state, observer } = snapshot()
    assert.equal(
      observer,
      "degraded",
      `${threshold} consecutive egress mismatches left the observer silently "${observer}"`,
    )
    assert.equal(
      severityOf(state),
      "error",
      `a persistently misrouted observer must reach Discord as an error, got overall "${state}"`,
    )
  })
}

test("a clean egress record resets the mismatch count", () => {
  const { snapshot, egress } = snapshots(3)
  egress(misrouted)
  egress(misrouted)
  snapshot()
  egress(misrouted)
  snapshot()
  egress({ ip: "1.1.1.2", tor: true })
  assert.equal(snapshot().state, "verified", "a clean egress must verify again")
  egress(misrouted)
  egress(misrouted)
  assert.equal(
    snapshot().observer,
    "unverified",
    "mismatches before a clean egress must not count toward the threshold",
  )
})

test("an oracle outage stays unverified indefinitely", () => {
  const { snapshot, egress } = snapshots(3)
  for (let i = 0; i < 10; i++) {
    egress(outage)
    assert.equal(
      snapshot().observer,
      "unverified",
      `oracle outage ${i + 1} must not page; it is not a misrouting`,
    )
  }
})
