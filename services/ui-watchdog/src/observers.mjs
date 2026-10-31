import { integrityKinds, reconcileEvidence } from "./policy.mjs"
import { assess } from "./scan.mjs"
import { publicAddress } from "./network.mjs"
import { request, safeError, timestamp } from "./util.mjs"

const fresh = (at, now, age) =>
  Number.isFinite(Date.parse(at)) &&
  now - Date.parse(at) <= age &&
  Date.parse(at) <= now + 30000
const withoutBodies = (r) =>
  r && { ...r, observed: undefined, responses: undefined, evidence: undefined }

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
      fresh(o.probe.completedAt, now, maxQuickAge),
  )
  const byPath = new Map()
  for (const o of usable) {
    const observed = { ...o.probe.observed }
    if (
      o.audit?.rootHash === o.probe.rootHash &&
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
  if (observers.some((o) => o.state === "reference_pending"))
    return out("reference_pending", [
      "Awaiting the current reference; all unknown observations are retained",
    ])
  for (const state of ["protection_inactive", "reference_failed"])
    if (observers.some((o) => o.state === state))
      return out(state, [
        state === "protection_inactive"
          ? "Integrity protection inactive: no attested reference is available"
          : "Production reference pipeline is unavailable",
      ])
  if (findings.length) {
    const knownRollout =
      source &&
      now - source.firstSeen < graceSeconds * 1000 &&
      usable.length === observers.length &&
      usable.every((o) => o.probe.matchedSha) &&
      observers.every(
        (o) => !["integrity_alert", "down", "degraded"].includes(o.state),
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
      raceCount: 0,
      failures: {},
      failurePaths: {},
      sequence: [],
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
      headers: {
        "content-type": "application/json",
        ...(s.token ? { authorization: `Bearer ${s.token}` } : {}),
      },
      body: JSON.stringify(body),
    })
    if (r.status !== 200) {
      const error = new Error(`Observer worker returned HTTP ${r.status}`)
      error.busy = r.status === 429
      throw error
    }
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
      body.trustedRoots?.[result.rootHash] !== result.matchedSha &&
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
    reconcileEvidence(result, this.references || [])
    this.store.saveEvidence(result.evidence)
    if (
      this.referenceStatus?.state !== "ready" &&
      this.source?.sha &&
      (!result.matchedSha ||
        result.matchedSha === this.source.sha ||
        result.documents?.some((d) => !d.matchedSha))
    )
      this.store.retainPending(this.source.sha, s.id, result)
    if (kind === "quick" && !result.error) {
      s.raceCount = result.racing ? s.raceCount + 1 : 0
      for (const d of result.documents || []) {
        if (s.sequence.at(-1) !== d.sha256) s.sequence.push(d.sha256)
      }
      s.sequence = s.sequence.slice(-8)
      s.flapping =
        s.sequence.length >= 3 && new Set(s.sequence).size < s.sequence.length
      // A stable check resolves the sequence, but never erases its hash evidence.
      if (Date.now() - (s.sequenceAt || 0) > 1200000) {
        s.sequence = s.sequence.slice(-2)
        s.sequenceAt = Date.now()
      }
      if (s.flapping && !result.racing) s.stable = (s.stable || 0) + 1
      else s.stable = 0
      if (s.stable >= 3) {
        s.sequence = s.sequence.slice(-1)
        s.flapping = false
      }
    }
    if (kind === "browser") {
      const key = `observer:${s.id}:origin-warnings`
      const warned = this.store.get(key, [])
      const freshOrigins = (result.issues || [])
        .filter((i) => i.kind === "external-origin" && !warned.includes(i.path))
        .map((i) => i.path)
        .slice(0, 20)
      if (freshOrigins.length) {
        this.event("external_origin", "warning", {
          observer: s.id,
          paths: freshOrigins,
          summary:
            "New external data/WebSocket origins outside the reviewed baseline",
        })
        this.store.set(key, [...warned, ...freshOrigins].slice(-100))
      }
    }
    const keys = result.error
      ? ["observer"]
      : (result.issues || [])
          .filter(
            (i) => !integrityKinds.has(i.kind) && i.kind !== "external-origin",
          )
          .map((i) => `${i.kind}:${i.path}`)
    const previousFailures = s.failurePaths[kind] || {}
    s.failurePaths[kind] = Object.fromEntries(
      keys.map((key) => [key, (previousFailures[key] || 0) + 1]),
    )
    s.failures[kind] = Math.max(0, ...Object.values(s.failurePaths[kind]))

    const key = `observer:${s.id}:observed`
    const previous = this.store.get(
      key,
      s.id === "direct" ? this.store.get("observed", {}) : {},
    )
    const paths = Object.keys(result.observed || {}).filter(
      (p) => previous[p] && previous[p].sha256 !== result.observed[p].sha256,
    )
    if (paths.length && Date.now() - (s.lastChange || 0) > 300000) {
      s.lastChange = Date.now()
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
    const merged = { ...previous, ...result.observed }
    const live = this.references?.find((r) => r.sha === result.matchedSha)
    const bounded = Object.fromEntries(
      Object.entries(merged)
        .filter(([p]) => !live || live.files[p])
        .slice(-20000),
    )
    this.store.set(key, bounded)
  }
  schedule(references, source, referenceStatus) {
    const current = references.find((r) => r.sha === source?.sha)
    if (current)
      references = [current, ...references.filter((r) => r !== current)]
    this.references = references
    this.source = source
    this.referenceStatus = referenceStatus
    for (const s of this.states)
      for (const result of [s.probe, s.audit, s.browser])
        reconcileEvidence(result, references)
    for (const s of this.states) {
      const live = references.find(
        (r) => r.files["/index.html"].sha256 === s.probe?.rootHash,
      )
      const selected = [
        ...new Set([live, ...references.slice(0, 8)].filter(Boolean)),
      ]
      const trustedRoots = Object.fromEntries(
        [...references]
          .reverse()
          .map((r) => [r.files["/index.html"].sha256, r.sha]),
      )
      this.background(`${s.id}:quick`, this.c.pollSeconds * 1000, async () => {
        try {
          const result = await this.call(
            s,
            "/observe",
            { references: selected, trustedRoots, full: false },
            240000,
          )
          this.record(s, result, "quick")
          s.probe = result
        } catch (e) {
          if (e.busy) {
            this.due.set(`${s.id}:quick`, Date.now() + 10000)
            return
          }
          s.failures.quick = (s.failures.quick || 0) + 1
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
            { references: selected, trustedRoots, full: true },
            240000,
          )
          this.record(s, s.audit, "audit")
        } catch (e) {
          if (e.busy) {
            this.due.set(`${s.id}:audit`, Date.now() + 10000)
            return
          }
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
        if (s.audit.error) s.failures.audit = (s.failures.audit || 0) + 1
        this.store.set(`observer:${s.id}:audit`, s.audit)
      })
      this.background(
        `${s.id}:browser`,
        this.c.browserSeconds * 1000,
        async () => {
          const rootHash = s.probe.rootHash,
            sha =
              references.find((r) => r.files["/index.html"].sha256 === rootHash)
                ?.sha || s.probe.matchedSha
          try {
            s.browser = await this.call(
              s,
              "/probe",
              {
                reference: references.find((r) => r.sha === sha) || null,
                rootHash,
                references: selected,
                trustedRoots,
              },
              290000,
            )
            this.record(s, s.browser, "browser")
          } catch (e) {
            if (e.busy) {
              this.due.set(`${s.id}:browser`, Date.now() + 10000)
              return
            }
            s.failures.browser = (s.failures.browser || 0) + 1
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
    const retrospective = this.store.get("retrospectiveIssues", []) || []

    const observers = this.states.map((s) => {
      let a = assess({
        probe: s.probe,
        audit: s.audit,
        browser: s.browser,
        source,
        sourceFresh,
        now,
        graceSeconds: this.c.graceSeconds,
        pendingSeconds: this.c.pendingSeconds,
        referenceStatus: this.referenceStatus,
        referenceCount: this.references?.length,
        referenceAvailable: this.references?.some((r) => r.sha === source?.sha),
        raceCount: s.raceCount,
        flapping: s.flapping,
        extraIssues: [
          ...retrospective.filter((f) => f.observer === s.id),
          ...(this.store.get("evidenceOverflow")
            ? [{ kind: "evidence-overflow" }]
            : []),
        ],
        maxAuditAge: this.c.fullSeconds * 2000 + 180000,
        maxBrowserAge: this.c.browserSeconds * 2000 + 300000,
      })
      if (
        ["down", "degraded"].includes(a.state) &&
        !Object.values(s.failures || {}).some(
          (n) => n >= (this.c.failureThreshold || 3),
        )
      )
        a = {
          state: "unverified",
          reasons: ["A transient check failure is being retried"],
        }
      if (
        ["verified", "unverified", "starting", "deployment_pending"].includes(
          a.state,
        )
      ) {
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
            state: "unverified",
            reasons: ["Network egress validation is unavailable; retrying"],
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
    const findings = [...combined.findings, ...retrospective]
    for (const o of observers)
      for (const r of [o.probe, o.audit, o.browser]) {
        if (r)
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
