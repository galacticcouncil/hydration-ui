import { setTimeout as sleep } from "node:timers/promises"
import {
  incidentFingerprint,
  shouldNotify,
  dailyHeartbeatDue,
} from "./policy.mjs"
import { config } from "./config.mjs"
import { deliver } from "./discord.mjs"
import { GitHub } from "./github.mjs"
import { validateManifest } from "./manifest.mjs"
import { ObserverGroup } from "./observers.mjs"
import { serve } from "./server.mjs"
import { Store } from "./store.mjs"
import { request, safeError, timestamp } from "./util.mjs"

const c = config()

if (["browser", "observer"].includes(c.role)) {
  const { serveObserver } = await import("./worker.mjs")
  serveObserver(c)
} else if (["nordvpn", "wireguard"].includes(c.role)) {
  const { serveVpn } = await import("./vpn.mjs")
  await serveVpn(c)
} else if (c.role === "watchdog") {
  const store = new Store(c.dataDir),
    github = new GitHub(c)
  let status = {
    ...store.get("status", {}),
    state: "starting",
    reasons: ["Revalidating observations after startup"],
  }
  let source = store.get("source"),
    sourceError = null,
    sourceChecked = 0
  let referenceStatus = {
    state: c.token ? "pending" : "unconfigured",
    message: c.token
      ? "Reference discovery is pending"
      : "Set GITHUB_TOKEN with Actions and Contents read access",
  }
  let heartbeat = Date.now(),
    stopped = false
  const tasks = new Map(),
    due = new Map()
  const logEvent = (kind, severity, data) => {
    const notify =
      severity === "critical" ||
      severity === "error" ||
      ["production_changed", "deployment_verified", "daily_heartbeat"].includes(
        kind,
      ) ||
      data.recovery
    store.event(kind, severity, data, Boolean(c.webhook && notify))
    console.log(
      JSON.stringify({
        at: timestamp(),
        kind,
        severity,
        summary: data.summary,
      }),
    )
  }
  function background(name, intervalMs, fn, retryMs = intervalMs) {
    if (tasks.has(name) || Date.now() < (due.get(name) || 0)) return
    let nextInterval = intervalMs
    due.set(name, Infinity)
    const task = fn()
      .catch((error) => {
        nextInterval = retryMs
        const message = safeError(error)
        if (name === "references")
          referenceStatus = {
            state: "error",
            message,
            checkedAt: timestamp(),
          }
        if (name === "source") sourceError = message
        console.error(
          JSON.stringify({
            at: timestamp(),
            component: name,
            error: message,
          }),
        )
      })
      .finally(() => {
        tasks.delete(name)
        if (due.get(name) === Infinity)
          due.set(name, Date.now() + nextInterval * (0.8 + Math.random() * 0.4))
      })
    tasks.set(name, task)
  }
  const group = new ObserverGroup(c, store, logEvent, background, due)
  let lastPersisted = 0,
    lastPruned = 0,
    verifiedSince = 0
  const armed = store.get("armed", {})
  const lostCredentials = Boolean(
    (armed.github && !c.token) || (armed.discord && !c.webhook),
  )
  store.set("armed", {
    github: armed.github || Boolean(c.token),
    discord: armed.discord || Boolean(c.webhook),
  })

  const publicStatus = () => ({
    ...status,
    target: c.target,
    repository: c.repo,
    branch: c.branch,
    pollSeconds: c.pollSeconds,
    references: referenceStatus,
    sourceError,
    notifications: {
      configured: Boolean(c.webhook),
      ...store.notifications(),
      failure: store.get("deliveryFailure"),
    },
  })
  const server = serve(
    c,
    store,
    publicStatus,
    () =>
      !lostCredentials &&
      status.state !== "watchdog_error" &&
      Date.now() - heartbeat < Math.max(180000, c.pollSeconds * 5000),
  )
  const signal = () => {
    stopped = true
  }
  process.on("SIGTERM", signal)
  process.on("SIGINT", signal)
  while (!stopped) {
    const started = Date.now()
    background("source", c.token ? 30000 : 300000, async () => {
      const sha = await github.head()
      sourceChecked = Date.now()
      sourceError = null
      if (sha !== source?.sha) {
        const previous = source?.sha
        source = { sha, firstSeen: Date.now() }
        referenceStatus = { state: c.token ? "pending" : "unconfigured", sha }
        store.set("source", source)
        const changelog = previous
          ? await github.compare(previous, sha).catch(() => null)
          : null
        logEvent("production_changed", "info", {
          sha,
          previous,
          changelog,
          summary: `Production now points to ${sha.slice(0, 12)}`,
        })
        due.set("references", 0)
      }
    })
    if (c.token)
      background(
        "references",
        referenceStatus.state === "ready" ? 300000 : 30000,
        async () => {
          const expected = source?.sha
          const result = await github.references(store, expected, (next) => {
            if (source?.sha === expected) referenceStatus = next
          })
          if (source?.sha === expected) referenceStatus = result
          else due.set("references", 0)
          if (result.added) {
            store.resolvePending(store.references())
            group.invalidate()
          }
        },
      )
    background("discord", 5000, () => deliver(store, c))
    try {
      const references = store
        .references()
        .map((r) => validateManifest(r, c))
        .sort(
          (a, b) =>
            Number(b.sha === source?.sha) - Number(a.sha === source?.sha),
        )
      group.schedule(references, source, referenceStatus)
      const {
        assessment,
        observers,
        findings,
        agreement,
        probe,
        audit,
        browser,
      } = group.snapshot(
        source,
        Date.now() - sourceChecked < (c.token ? 180000 : 900000),
      )
      const currentSha = probe?.matchedSha
      if (!c.webhook && assessment.state === "verified")
        Object.assign(assessment, {
          state: "alerting_inactive",
          reasons: [
            "Content checks passed, but Discord alert delivery is not configured",
          ],
        })
      if (lostCredentials)
        Object.assign(assessment, {
          state: "credentials_missing",
          reasons: ["Previously configured monitoring credentials are missing"],
        })
      const fingerprint = incidentFingerprint(assessment, observers)
      const lastNotice = store.get("notice", {
        fingerprint: "",
        at: 0,
        state: "starting",
      })
      const recovered = assessment.state === "verified"
      if (!recovered) verifiedSince = 0
      else if (!verifiedSince) verifiedSince = Date.now()
      const openIncident =
        lastNotice.state === "integrity_alert" &&
        (!recovered || Date.now() - verifiedSince < 60000)
      if (
        shouldNotify(
          assessment,
          observers,
          lastNotice,
          Date.now(),
          verifiedSince,
        )
      ) {
        const severity =
          assessment.state === "integrity_alert"
            ? "critical"
            : [
                  "down",
                  "degraded",
                  "stale_deployment",
                  "protection_inactive",
                  "reference_failed",
                  "credentials_missing",
                  "alerting_inactive",
                ].includes(assessment.state)
              ? "error"
              : assessment.state === "verified"
                ? "info"
                : "warning"
        logEvent(
          assessment.state === "verified"
            ? "verification_passed"
            : "verification_changed",
          severity,
          {
            ...assessment,
            recovery:
              recovered &&
              [
                "integrity_alert",
                "degraded",
                "down",
                "watchdog_error",
              ].includes(lastNotice.state),
            sha: currentSha,
            expectedSha: source?.sha,
            findings,
            observers: observers.map((o) => ({
              id: o.id,
              state: o.state,
            })),
            paths: [...new Set(findings.map((f) => f.path))],
            summary: assessment.reasons.join("; "),
          },
        )
        store.set("notice", {
          fingerprint,
          at: Date.now(),
          state: assessment.state,
        })
      }
      if (assessment.state === "integrity_alert")
        store.set("retrospectiveIssues", [])
      const lastRelease = store.get("release")
      if (assessment.state === "verified" && lastRelease !== currentSha) {
        const changelog = lastRelease
          ? await github.compare(lastRelease, currentSha).catch(() => null)
          : null
        logEvent("deployment_verified", "info", {
          sha: currentSha,
          previous: lastRelease,
          changelog,
          summary: `Verified release ${currentSha.slice(0, 12)}`,
        })
        store.set("release", currentSha)
      }
      status = {
        ...assessment,
        checkedAt: timestamp(),
        source,
        observers,
        agreement,
        probe,
        audit: audit && { ...audit, observed: undefined },
        browser: browser && { ...browser, responses: undefined },
      }
      if (Date.now() - lastPersisted >= c.pollSeconds * 1000) {
        store.set("status", status)
        lastPersisted = Date.now()
      }
      heartbeat = Date.now()
      if (
        !openIncident &&
        dailyHeartbeatDue(assessment.state, store.get("dailyHeartbeat", 0))
      ) {
        logEvent("daily_heartbeat", "info", {
          sha: currentSha,
          summary:
            "Watchdog is running; all required observers verify production",
        })
        store.set("dailyHeartbeat", Date.now())
      }
      if (
        c.heartbeatUrl &&
        !lostCredentials &&
        c.webhook &&
        c.token &&
        references.length &&
        !store.get("deliveryFailure")
      )
        background("external-heartbeat", 60000, async () => {
          const r = await request(c.heartbeatUrl, {
            timeoutMs: 10000,
            maxBytes: 16384,
          })
          if (r.status < 200 || r.status >= 300)
            throw new Error("External heartbeat delivery failed")
        })
      if (Date.now() - lastPruned > 60000) {
        store.prune(c.retentionDays)
        lastPruned = Date.now()
      }
    } catch (error) {
      console.error(
        JSON.stringify({
          at: timestamp(),
          component: "watchdog",
          error: safeError(error),
        }),
      )
      status = {
        ...status,
        state: "watchdog_error",
        reasons: [safeError(error)],
      }
    }
    await sleep(Math.max(1000, 5000 - (Date.now() - started)))
  }
  server.close()
  // Swarm's stop grace period allows pending SQLite/event writes to finish.
  await Promise.allSettled([...tasks.values()])
  store.close()
} else throw new Error("Unknown watchdog ROLE")
