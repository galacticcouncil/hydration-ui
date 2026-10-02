import { assess } from "./scan.mjs"
import { publicAddress } from "./network.mjs"
import { request, safeError, timestamp } from "./util.mjs"

const fresh = (at, now, age) =>
  Number.isFinite(Date.parse(at)) &&
  now - Date.parse(at) <= age &&
  Date.parse(at) <= now + 30000
const withoutBodies = (r) =>
  r && { ...r, observed: undefined, responses: undefined }

export function combineObservers(
  observers,
  {
    source,
    now = Date.now(),
    minDistinct = observers.length,
    graceSeconds = 900,
    maxQuickAge = 240000,
  } = {},
) {
  const findings = []
  const usable = observers.filter(
    (o) =>
      o.probe?.rootHash &&
      !o.probe.error &&
      !o.probe.racing &&
      fresh(o.probe.completedAt, now, maxQuickAge),
  )
  const byPath = new Map()
  for (const o of usable) {
    const observed = { ...o.probe.observed }
    if (
      o.audit?.rootHash === o.probe.rootHash &&
      !o.audit.racing &&
      fresh(o.audit.completedAt, now, 780000)
    )
      Object.assign(observed, o.audit.observed)
    // The quick result is the most recent sample of root/entry resources.
    Object.assign(observed, o.probe.observed)
    for (const [path, f] of Object.entries(observed)) {
      if (!byPath.has(path)) byPath.set(path, [])
      byPath
        .get(path)
        .push({ observer: o.id, hash: f.sha256, root: o.probe.rootHash })
    }
  }
  for (const [path, samples] of byPath) {
    if (new Set(samples.map((s) => s.hash)).size > 1 && findings.length < 30)
      findings.push({
        kind: "observer-disagreement",
        path,
        observers: samples.map((s) => s.observer),
        message: `Different bytes observed by ${samples.map((s) => s.observer).join(", ")}`,
      })
  }
  const ips = observers.map((o) => o.probe?.egress?.ip).filter(Boolean)
  const browserIps = observers.map((o) => o.browser?.egress?.ip).filter(Boolean)
  const distinct = new Set(ips).size
  const browserDistinct = new Set(browserIps).size
  const agreement = {
    comparedObservers: usable.map((o) => o.id),
    differingPaths: findings.map((f) => f.path),
    distinctEgress: distinct,
    distinctBrowserEgress: browserDistinct,
    requiredDistinctEgress: minDistinct,
  }
  const out = (state, reasons) => ({
    assessment: { state, reasons },
    agreement,
    findings,
  })
  if (observers.some((o) => o.state === "integrity_alert"))
    return out(
      "integrity_alert",
      observers
        .filter((o) => o.state === "integrity_alert")
        .map((o) => `${o.id}: integrity verification failed`),
    )
  if (findings.length) {
    const knownRollout =
      source &&
      now - source.firstSeen < graceSeconds * 1000 &&
      usable.length === observers.length &&
      usable.every((o) => o.probe.matchedSha) &&
      observers.every((o) =>
        ["verified", "deployment_pending"].includes(o.state),
      )
    if (knownRollout)
      return out("deployment_pending", [
        "Observers see different trusted releases during the rollout window",
      ])
    return out("integrity_alert", [
      "Network observers received different content; investigate selective serving or deployment inconsistency",
    ])
  }
  const unavailable = observers.filter(
    (o) => o.state === "down" || o.state === "degraded",
  )
  if (unavailable.length)
    return out(
      "degraded",
      unavailable.map((o) => `${o.id}: ${o.reasons.join("; ")}`),
    )
  if (observers.some((o) => o.state === "stale_deployment"))
    return out("stale_deployment", [
      "At least one observer sees a release behind production",
    ])
  if (observers.some((o) => o.state === "deployment_pending"))
    return out("deployment_pending", [
      "At least one observer is waiting for the current production release",
    ])
  if (observers.some((o) => o.state !== "verified"))
    return out(
      "unverified",
      observers
        .filter((o) => o.state !== "verified")
        .map((o) => `${o.id}: ${o.reasons.join("; ")}`)
        .slice(0, 8),
    )
  if (distinct < minDistinct || browserDistinct < minDistinct)
    return out("unverified", [
      "Required observers do not have enough distinct sampled exit IPs",
    ])
  return out("verified", [
    "Every required network observer matches the production reference and passes browser checks with distinct sampled exits",
  ])
}

export class ObserverGroup {
  constructor(c, store, event, background, due) {
    Object.assign(this, { c, store, event, background, due })
    this.states = c.observers.map((o) => ({
      ...o,
      probe: null,
      audit: store.get(`observer:${o.id}:audit`),
      browser: store.get(`observer:${o.id}:browser`),
    }))
  }
  invalidate() {
    for (const s of this.states)
      for (const kind of ["quick", "audit", "browser"])
        this.due.set(`${s.id}:${kind}`, 0)
  }
  async call(s, path, body, timeoutMs) {
    const r = await request(new URL(path, s.url), {
      method: "POST",
      timeoutMs,
      maxBytes: 8 * 1024 * 1024,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    if (r.status !== 200)
      throw new Error(`Observer worker returned HTTP ${r.status}`)
    const data = JSON.parse(r.bytes)
    if (
      data.observerId !== s.id ||
      data.kind !== s.kind ||
      !data.result ||
      typeof data.result !== "object"
    )
      throw new Error("Observer identity mismatch")
    const result = data.result
    if (result.rootHash && !/^[a-f0-9]{64}$/.test(result.rootHash))
      throw new Error("Invalid observer root hash")
    if (!Array.isArray(result.issues) || result.issues.length > 1000)
      throw new Error("Invalid observer findings")
    if (
      !result.error &&
      !fresh(result.completedAt, Date.now(), timeoutMs + 30000)
    )
      throw new Error("Invalid observer timestamp")
    if (result.observed) {
      const entries = Object.entries(result.observed)
      if (
        entries.length > 20000 ||
        entries.some(
          ([p, f]) =>
            !p.startsWith("/") ||
            !f ||
            !/^[a-f0-9]{64}$/.test(f.sha256) ||
            !Number.isSafeInteger(f.size) ||
            f.size < 0,
        )
      )
        throw new Error("Invalid observer inventory")
    }
    if (
      path === "/probe" &&
      (result.rootHash !== body.rootHash ||
        result.matchedSha !== (body.reference?.sha || null))
    )
      throw new Error("Browser result belongs to a different release")
    if (
      path === "/observe" &&
      result.matchedSha &&
      !body.references.some(
        (r) =>
          r.sha === result.matchedSha &&
          r.files["/index.html"].sha256 === result.rootHash,
      )
    )
      throw new Error("Observer claimed an unknown reference")
    return result
  }
  record(s, result, kind) {
    const key = `observer:${s.id}:observed`
    const previous = this.store.get(
      key,
      s.id === "direct" ? this.store.get("observed", {}) : {},
    )
    const paths = Object.keys(result.observed || {}).filter(
      (p) => previous[p] && previous[p].sha256 !== result.observed[p].sha256,
    )
    if (paths.length) {
      this.event(
        kind === "quick" ? "content_changed" : "assets_changed",
        "warning",
        {
          observer: s.id,
          sha: result.matchedSha,
          paths,
          summary: `${s.id}: ${paths.length} observed file(s) changed`,
        },
      )
      this.due.set(`${s.id}:browser`, 0)
      if (kind === "quick") this.due.set(`${s.id}:audit`, 0)
    }
    this.store.set(key, { ...previous, ...result.observed })
  }
  schedule(references) {
    for (const s of this.states) {
      this.background(`${s.id}:quick`, this.c.pollSeconds * 1000, async () => {
        try {
          const result = await this.call(
            s,
            "/observe",
            { references, full: false },
            240000,
          )
          this.record(s, result, "quick")
          s.probe = result
        } catch (e) {
          s.probe = {
            error: safeError(e),
            at: timestamp(),
            completedAt: timestamp(),
            issues: [],
          }
        }
      })
      if (!s.probe?.rootHash || s.probe.error) continue
      this.background(`${s.id}:audit`, this.c.fullSeconds * 1000, async () => {
        const rootHash = s.probe.rootHash,
          matchedSha = s.probe.matchedSha
        try {
          s.audit = await this.call(
            s,
            "/observe",
            { references, full: true },
            240000,
          )
          this.record(s, s.audit, "audit")
        } catch (e) {
          s.audit = {
            error: safeError(e),
            rootHash,
            matchedSha,
            completedAt: timestamp(),
            full: false,
            issues: [
              {
                kind: "observer-error",
                path: "/",
                message: safeError(e),
              },
            ],
          }
        }
        this.store.set(`observer:${s.id}:audit`, s.audit)
      })
      this.background(
        `${s.id}:browser`,
        this.c.browserSeconds * 1000,
        async () => {
          const rootHash = s.probe.rootHash,
            sha = s.probe.matchedSha
          try {
            s.browser = await this.call(
              s,
              "/probe",
              {
                reference: references.find((r) => r.sha === sha) || null,
                rootHash,
              },
              290000,
            )
          } catch (e) {
            s.browser = {
              rootHash,
              matchedSha: sha,
              completedAt: timestamp(),
              issues: [
                {
                  kind: "browser-error",
                  path: "/",
                  message: safeError(e),
                },
              ],
            }
            throw e
          } finally {
            this.store.set(`observer:${s.id}:browser`, s.browser)
          }
        },
        this.c.pollSeconds * 1000,
      )
    }
  }
  snapshot(source, sourceFresh, now = Date.now()) {
    const observers = this.states.map((s) => {
      let a = assess({
        probe: s.probe,
        audit: s.audit,
        browser: s.browser,
        source,
        sourceFresh,
        now,
        graceSeconds: this.c.graceSeconds,
        maxAuditAge: this.c.fullSeconds * 2000 + 180000,
        maxBrowserAge: this.c.browserSeconds * 2000 + 300000,
      })
      if (!["down", "degraded", "integrity_alert"].includes(a.state)) {
        if (!s.probe || !fresh(s.probe.completedAt, now, 240000))
          a = {
            state: "unverified",
            reasons: ["A fresh observation is required"],
          }
        const networks = [s.probe?.egress, s.browser?.egress]
        if (
          networks.some(
            (n) =>
              !n?.ip ||
              !publicAddress(n.ip) ||
              n.error ||
              n.tor !== (s.kind === "tor") ||
              !fresh(n.checkedAt, now, this.c.browserSeconds * 2000 + 300000),
          )
        )
          a = {
            state: "unverified",
            reasons: ["Fresh HTTP and browser egress checks are required"],
          }
        if (networks.some((n) => n?.error))
          a = {
            state: "degraded",
            reasons: [
              "Network egress validation failed; this path cannot be trusted",
            ],
          }
      }
      return {
        id: s.id,
        kind: s.kind,
        ...a,
        probe: s.probe,
        audit: s.audit,
        browser: s.browser,
      }
    })
    const combined = combineObservers(observers, {
      source,
      now,
      minDistinct: this.c.minDistinctEgress,
      graceSeconds: this.c.graceSeconds,
    })
    const findings = [...combined.findings]
    for (const o of observers)
      for (const r of [o.probe, o.audit, o.browser]) {
        if (r?.rootHash === o.probe?.rootHash)
          findings.push(
            ...(r?.issues || []).map((f) => ({ ...f, observer: o.id })),
          )
      }
    const primary = observers[0]
    return {
      ...combined,
      findings: findings.slice(0, 100),
      observers: observers.map((o) => ({
        ...o,
        probe: withoutBodies(o.probe),
        audit: withoutBodies(o.audit),
        browser: withoutBodies(o.browser),
      })),
      probe: withoutBodies(primary.probe),
      audit: withoutBodies(primary.audit),
      browser: withoutBodies(primary.browser),
    }
  }
}
