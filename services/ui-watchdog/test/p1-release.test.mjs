// P1: every production release pages as critical. Netlify publishes ~2.5 min
// after the push; the attested reference needs two uncached builds + an attest
// job and is polled every 5 min (main.mjs:128), so the new HTML is first seen
// with references=[previous] -> scan.mjs:88-94 hash-mismatch -> integrity_alert.
// Staggered 30 s probes also make observers disagree during the switch, and
// observers.mjs:81-88 only accepts that when every observer is already
// verified/deployment_pending, which a just-switched observer never is.
import test from "node:test"
import assert from "node:assert/strict"
import { observe } from "../src/scan.mjs"
import {
  A,
  B,
  cfg,
  fakeHtml,
  group,
  observerState,
  refA,
  refB,
  severityOf,
  shaB,
  site,
} from "./review-fixtures.mjs"

const FAKE = { ...A, "/index.html": fakeHtml() }

// Observer i: full audit while A was live (5 min cadence), then its latest
// quick probe sees `sees`.
async function rollout(t, references, sees) {
  const states = []
  for (const [i, files] of sees.entries()) {
    const deploy = { files: A }
    const s = await site(t, { deploy })
    const audit = await observe(cfg(s.target), [refA], { full: true })
    deploy.files = files
    const probe = await observe(cfg(s.target), references)
    states.push(
      observerState(i, {
        probe,
        audit,
        browser: { rootHash: audit.rootHash, matchedSha: audit.matchedSha },
      }),
    )
  }
  return states
}
const justMerged = () => ({ sha: shaB, firstSeen: Date.now() - 60000 })

test("P1: a release whose attested reference is still building does not page", async (t) => {
  const states = await rollout(t, [refA], [B, B, B])
  const source = justMerged()
  const snap = group(states, [refA]).snapshot(source, true, Date.now())
  assert.deepEqual(
    snap.observers.map((o) => o.state),
    ["deployment_pending", "deployment_pending", "deployment_pending"],
  )
  assert.equal(snap.assessment.state, "deployment_pending")
  assert.equal(severityOf(snap.assessment.state), "warning")
})

test("P1: staggered probes during a rollout of attested builds do not page", async (t) => {
  for (const references of [[refA, refB], [refA]]) {
    const states = await rollout(t, references, [A, B, B])
    const snap = group(states, references).snapshot(justMerged(), true, Date.now())
    assert.equal(
      snap.assessment.state,
      "deployment_pending",
      `${references.length} reference(s): ${JSON.stringify(snap.assessment.reasons)}`,
    )
  }
})

test("P1 guard: unknown HTML is critical once the new reference exists or grace expires", async (t) => {
  let states = await rollout(t, [refA, refB], [FAKE, FAKE, FAKE])
  let snap = group(states, [refA, refB]).snapshot(justMerged(), true, Date.now())
  assert.equal(snap.assessment.state, "integrity_alert")
  states = await rollout(t, [refA], [B, B, B])
  const expired = { sha: shaB, firstSeen: Date.now() - 1000000 }
  snap = group(states, [refA]).snapshot(expired, true, Date.now())
  assert.equal(snap.assessment.state, "integrity_alert")
})

test("P1: HTML tolerated while the reference was pending is re-checked when it lands", async (t) => {
  // Release-timed injection: fake while B's reference builds, real afterwards.
  const source = justMerged()
  const g = group(await rollout(t, [refA], [FAKE, FAKE, FAKE]), [refA])
  assert.equal(g.snapshot(source, true, Date.now()).assessment.state, "deployment_pending")
  g.states = await rollout(t, [refA, refB], [B, B, B])
  g.schedule([refA, refB])
  assert.equal(g.snapshot(source, true, Date.now()).assessment.state, "integrity_alert")
  // The legitimate sequence (B seen early, then attested) stays quiet.
  const ok = group(await rollout(t, [refA], [B, B, B]), [refA])
  assert.equal(ok.snapshot(source, true, Date.now()).assessment.state, "deployment_pending")
  ok.states = await rollout(t, [refA, refB], [B, B, B])
  ok.schedule([refA, refB])
  assert.notEqual(ok.snapshot(source, true, Date.now()).assessment.state, "integrity_alert")
})
