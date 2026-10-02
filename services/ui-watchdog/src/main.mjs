import { createServer } from "node:http"
import { setTimeout as sleep } from "node:timers/promises"
import { config } from "./config.mjs"
import { deliver } from "./discord.mjs"
import { GitHub } from "./github.mjs"
import { validateManifest } from "./manifest.mjs"
import { assess, observe } from "./scan.mjs"
import { serve } from "./server.mjs"
import { Store } from "./store.mjs"
import { request, safeError, sha256, timestamp } from "./util.mjs"

const c = config()

if (c.role === "browser") {
  const { probeBrowser } = await import("./browser.mjs")
  let busy = false
  const server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/healthz") {
      res.end("ok")
      return
    }
    if (req.method !== "POST" || req.url !== "/probe") {
      res.writeHead(404).end()
      return
    }
    if (busy) {
      res.writeHead(429).end()
      return
    }
    busy = true
    try {
      let size = 0
      const chunks = []
      for await (const chunk of req) {
        size += chunk.length
        if (size > 8 * 1024 * 1024)
          throw new Error("Probe request exceeds size limit")
        chunks.push(chunk)
      }
      const body = JSON.parse(Buffer.concat(chunks))
      if (!/^[a-f0-9]{64}$/.test(body.rootHash))
        throw new Error("Invalid root hash")
      const reference = body.reference
        ? validateManifest(body.reference, c)
        : null
      const result = await probeBrowser(c, reference, body.rootHash)
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify(result))
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: safeError(error) }))
    } finally {
      busy = false
    }
  })
  server.requestTimeout = 300000
  server.headersTimeout = 10000
  server.listen(c.port, "0.0.0.0")
  process.on("SIGTERM", () => server.close(() => process.exit(0)))
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
  let audit = store.get("audit"),
    browser = store.get("browser"),
    probe = null
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
  function background(name, intervalMs, fn) {
    if (tasks.has(name) || Date.now() < (due.get(name) || 0)) return
    const task = fn()
      .catch((error) => {
        const message = safeError(error)
        if (name === "references")
          referenceStatus = { state: "error", message, checkedAt: timestamp() }
        if (name === "source") sourceError = message
        console.error(
          JSON.stringify({ at: timestamp(), component: name, error: message }),
        )
      })
      .finally(() => {
        tasks.delete(name)
        due.set(name, Date.now() + intervalMs)
      })
    tasks.set(name, task)
  }
  const publicStatus = () => ({
    ...status,
    target: c.target,
    repository: c.repo,
    branch: c.branch,
    pollSeconds: c.pollSeconds,
    references: referenceStatus,
    sourceError,
    notifications: { configured: Boolean(c.webhook), ...store.notifications() },
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
          due.set("audit", 0)
          due.set("browser", 0)
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
      probe = await observe(c, references)
      const previous = store.get("observed", {})
      const changed = Object.keys(probe.observed).filter(
        (p) => previous[p] && previous[p].sha256 !== probe.observed[p].sha256,
      )
      if (changed.length) {
        logEvent("content_changed", "warning", {
          sha: probe.matchedSha,
          paths: changed,
          summary: `${changed.length} observed file(s) changed; verification scheduled`,
        })
        due.set("audit", 0)
        due.set("browser", 0)
      }
      store.set("observed", { ...previous, ...probe.observed })
      const currentRoot = probe.rootHash,
        currentSha = probe.matchedSha
      if (currentRoot) {
        background("audit", c.fullSeconds * 1000, async () => {
          const result = await observe(c, references, { full: true })
          audit = result
          store.set("audit", result)
          const old = store.get("observed", {})
          const paths = Object.keys(result.observed).filter(
            (p) => old[p] && old[p].sha256 !== result.observed[p].sha256,
          )
          if (paths.length)
            logEvent("assets_changed", "warning", {
              sha: result.matchedSha,
              paths,
              summary: `${paths.length} assets changed during the complete scan`,
            })
          store.set("observed", { ...old, ...result.observed })
        })
        background("browser", c.browserSeconds * 1000, async () => {
          try {
            const r = await request(new URL("/probe", c.browserUrl), {
              method: "POST",
              timeoutMs: 290000,
              maxBytes: 4 * 1024 * 1024,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                reference: references.find((r) => r.sha === currentSha) || null,
                rootHash: currentRoot,
              }),
            })
            if (r.status !== 200)
              throw new Error(`Browser worker returned HTTP ${r.status}`)
            browser = JSON.parse(r.bytes)
            if (
              browser.rootHash !== currentRoot ||
              browser.matchedSha !== currentSha ||
              !Array.isArray(browser.issues) ||
              !browser.completedAt
            )
              throw new Error("Invalid browser worker result")
          } catch (error) {
            browser = {
              matchedSha: currentSha,
              rootHash: currentRoot,
              completedAt: timestamp(),
              issues: [
                { kind: "browser-error", path: "/", message: safeError(error) },
              ],
            }
          }
          store.set("browser", browser)
        })
      }
      const assessment = assess({
        probe,
        audit,
        browser,
        source,
        sourceFresh: Date.now() - sourceChecked < (c.token ? 180000 : 900000),
        graceSeconds: c.graceSeconds,
        maxAuditAge: c.fullSeconds * 2000 + 180000,
        maxBrowserAge: c.browserSeconds * 2000 + 300000,
      })
      const findings = [
        ...(probe.issues || []),
        ...(audit?.rootHash === currentRoot ? audit.issues || [] : []),
        ...(browser?.rootHash === currentRoot ? browser.issues || [] : []),
      ].slice(0, 100)
      const fingerprint = sha256(
        JSON.stringify([
          assessment,
          currentSha,
          currentRoot,
          [
            ...new Set(
              findings.map((f) =>
                JSON.stringify([f.kind, f.path, f.actual || f.message || ""]),
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
        probe: { ...probe, observed: undefined },
        audit: audit && { ...audit, observed: undefined },
        browser: browser && { ...browser, responses: undefined },
      }
      store.set("status", status)
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
    await sleep(Math.max(1000, c.pollSeconds * 1000 - (Date.now() - started)))
  }
  server.close()
  // Swarm's stop grace period allows pending SQLite/event writes to finish.
  await Promise.allSettled([...tasks.values()])
  store.close()
} else throw new Error("ROLE must be watchdog or browser")
