// Bypass #1 "switching the page between checks" (Discord, Jakub). At 54527f90e
// scan.mjs:200 returns `unverified` on probe.racing || audit.racing before any
// integrity issue is looked at, and observers.mjs:24-29 drops racing observers
// from the cross-observer comparison, so every observer (and the aggregate)
// only warns. Fixture: one origin per observer (attacker keyed on client IP).
import test from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { assess } from "../src/scan.mjs"
import {
  A,
  B,
  cfg,
  fakeHtml,
  group,
  html,
  refA,
  refB,
  sample,
  severityOf,
  shaA,
  shaB,
  site,
} from "./review-fixtures.mjs"

const attacks = {
  // (a) fake and real alternate on every "/" request
  "alternate fake/real per request": () => (req, url, s) =>
    url.pathname === "/" && ++s.roots % 2 === 1 ? html(fakeHtml()) : undefined,
  // (b) fake HTML with a random per-request nonce, so the two loads never match
  "fake with a per-request nonce": () => (req, url) =>
    url.pathname === "/"
      ? html(fakeHtml(`<!-- ${randomUUID()} -->`))
      : undefined,
  // (c) fake on the first "/" of each 5 s window, real afterwards
  "fake first per window, then real": () => (req, url, s) => {
    if (url.pathname !== "/") return
    const w = Math.floor(Date.now() / 5000)
    if (s.window === w) return
    s.window = w
    return html(fakeHtml())
  },
  // (d) a stable fake page; a preload decoy that only the full audit fetches
  //     (scan.mjs:22/105-109) arms a one-shot variation, so only the audit races
  "stable fake, only the full audit races": () => (req, url, s) => {
    if (url.pathname === "/assets/decoy.js") {
      s.armed = true
      return { type: "application/javascript", body: "" }
    }
    if (url.pathname !== "/") return
    const extra = '<link rel="modulepreload" href="/assets/decoy.js">'
    if (!s.armed) return html(fakeHtml(extra))
    s.armed = false
    return html(fakeHtml(extra + "<!-- v2 -->"))
  },
  // (e) real first, fake on the re-fetch (scan.mjs:166-168 never checks it)
  "real first, fake on the re-fetch": () => (req, url, s) => {
    if (url.pathname !== "/") return
    const w = Math.floor(Date.now() / 5000)
    if (s.window === w) return html(fakeHtml())
    s.window = w
  },
}

for (const [name, attack] of Object.entries(attacks))
  test(`Bypass #1 (${name}): untrusted HTML is critical even when loads differ`, async (t) => {
    const states = []
    for (let i = 0; i < 3; i++) {
      const s = await site(t, { deploy: { files: A }, attack: attack() })
      states.push(await sample(i, cfg(s.target), [refA]))
    }
    const now = Date.now()
    const source = { sha: shaA, firstSeen: now - 1000000 }
    for (const o of states)
      assert.equal(
        assess({ ...o, source, now }).state,
        "integrity_alert",
        `${o.id}: racing=${o.probe.racing} auditRacing=${o.audit.racing}`,
      )
    const { assessment } = group(states, [refA]).snapshot(source, true, now)
    assert.equal(assessment.state, "integrity_alert")
    assert.equal(severityOf(assessment.state), "critical")
  })

test("a release race between two attested builds stays non-critical", async (t) => {
  // B goes live between the HTML and the entry fetch; A's vanished chunks are
  // answered by the SPA rewrite (B's index.html, 200) -> asset hash-mismatch.
  const states = []
  for (let i = 0; i < 3; i++) {
    const deploy = { files: A }
    const s = await site(t, {
      deploy,
      onRequest: (url) => {
        if (url.pathname.startsWith("/assets/")) deploy.files = B
      },
    })
    states.push(await sample(i, cfg(s.target), [refA, refB]))
    assert(states[i].probe.racing, "fixture must straddle the switch")
  }
  const now = Date.now()
  const source = { sha: shaB, firstSeen: now - 60000 }
  for (const o of states)
    assert.equal(assess({ ...o, source, now }).state, "unverified")
  const { assessment } = group(states, [refA, refB]).snapshot(source, true, now)
  assert.notEqual(assessment.state, "integrity_alert")
  assert.equal(severityOf(assessment.state), "warning")
})

// Residual after the minimal fix (the lead's suggestion): alternate two
// ATTESTED documents so every probe races, and tamper with B's entry chunk.
// Fails at 54527f90e and with the minimal fix; passes when a race outside the
// rollout window no longer masks asset mismatches.
test("outside a release window, alternating attested documents cannot mask a tampered asset", async (t) => {
  const states = []
  for (let i = 0; i < 3; i++) {
    const s = await site(t, {
      deploy: { files: B },
      attack: (req, url, st) => {
        if (url.pathname === "/") return html((++st.roots % 2 ? B : A)["/index.html"])
        if (url.pathname === "/assets/index-bbbb2222.js")
          return { type: "application/javascript", body: "/* drainer */" }
      },
    })
    states.push(await sample(i, cfg(s.target), [refA, refB]))
  }
  const now = Date.now()
  const source = { sha: shaB, firstSeen: now - 3600000 }
  const { assessment } = group(states, [refA, refB]).snapshot(source, true, now)
  assert.equal(assessment.state, "integrity_alert")
})
