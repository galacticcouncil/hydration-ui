import { setTimeout as sleep } from "node:timers/promises"
import { config } from "./config.mjs"
import { deliver } from "./discord.mjs"
import { GitHub } from "./github.mjs"
import { validateManifest } from "./manifest.mjs"
import { ObserverGroup } from "./observers.mjs"
import { serve } from "./server.mjs"
import { Store } from "./store.mjs"
import { safeError, sha256, timestamp } from "./util.mjs"

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
    store.event(kind, severity, data, Boolean(c.webhook))
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
        due.set(name, Date.now() + nextInterval)
      })
    tasks.set(name, task)
  }
  const group = new ObserverGroup(c, store, logEvent, background, due)
  let lastPersisted = 0
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
    },
  })
  const server = serve(
    c,
    store,
    publicStatus,
    () => Date.now() - heartbeat < Math.max(180000, c.pollSeconds * 5000),
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
      background("references", 300000, async () => {
        referenceStatus = await github.references(store, source?.sha)
        if (referenceStatus.added) {
          group.invalidate()
        }
      })
    background("discord", 5000, () => deliver(store, c))
    try {
      const references = store
        .references()
        .map((r) => validateManifest(r, c))
        .sort(
          (a, b) =>
            Number(b.sha === source?.sha) - Number(a.sha === source?.sha),
        )
      group.schedule(references)
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
      const currentSha = probe?.matchedSha,
        currentRoot = probe?.rootHash
      const fingerprint = sha256(
        JSON.stringify([
          assessment,
          currentSha,
          currentRoot,
          observers.map((o) => [
            o.id,
            o.state,
            o.probe?.rootHash,
            o.probe?.matchedSha,
          ]),
          [
            ...new Set(
              findings.map((f) =>
                JSON.stringify([
                  f.observer || f.observers,
                  f.kind,
                  f.path,
                  f.actual || f.message || "",
                ]),
              ),
            ),
          ].sort(),
        ]),
      )
      const lastNotice = store.get("notice", {
        fingerprint: "",
        at: 0,
        state: "starting",
      })
      if (
        lastNotice.fingerprint !== fingerprint ||
        (assessment.state !== "verified" &&
          Date.now() - lastNotice.at >= c.reminderSeconds * 1000)
      ) {
        const severity =
          assessment.state === "integrity_alert"
            ? "critical"
            : ["down", "degraded", "stale_deployment"].includes(
                  assessment.state,
                )
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
            sha: currentSha,
            expectedSha: source?.sha,
            findings,
            observers: observers.map((o) => ({
              id: o.id,
              state: o.state,
              exitIp: o.probe?.egress?.ip,
            })),
            paths: [...new Set(findings.map((f) => f.path))],
            summary: assessment.reasons.join("; "),
          },
        )
        if (
          assessment.state === "verified" &&
          !["starting", "verified"].includes(lastNotice.state)
        )
          logEvent("recovered", "info", {
            sha: currentSha,
            summary: "The app now matches production and passes verification",
          })
        store.set("notice", {
          fingerprint,
          at: Date.now(),
          state: assessment.state,
        })
      }
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
      store.prune(c.retentionDays)
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
