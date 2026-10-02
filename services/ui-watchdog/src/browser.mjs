import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { chromium } from "playwright"
import { sha256, safeError, timestamp } from "./util.mjs"

export function publicAddress(ip) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number)
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19))
    )
  }
  if (isIP(ip) === 6) {
    const s = ip.toLowerCase()
    return /^[23]/.test(s) && !s.startsWith("2001:db8:")
  }
  return false
}

export function publicNetworkPolicy() {
  const cache = new Map()
  return async (raw) => {
    try {
      const u = new URL(raw)
      if (
        !["https:", "wss:"].includes(u.protocol) ||
        u.username ||
        u.password ||
        (u.port && u.port !== "443")
      )
        return false
      const host = u.hostname.replace(/^\[|\]$/g, "")
      if (isIP(host)) return publicAddress(host)
      if (!cache.has(host))
        cache.set(
          host,
          lookup(host, { all: true })
            .then(
              (a) => a.length > 0 && a.every((x) => publicAddress(x.address)),
            )
            .catch(() => false),
        )
      return await cache.get(host)
    } catch {
      return false
    }
  }
}

export async function probeBrowser(
  c,
  reference,
  rootHash,
  { allowNetwork = publicNetworkPolicy(), executablePath } = {},
) {
  const out = {
    matchedSha: reference?.sha || null,
    rootHash,
    issues: [],
    routes: [],
    externalOrigins: [],
    responses: [],
  }
  const issueKeys = new Set(),
    origins = new Set()
  const add = (issue) => {
    const key = `${issue.kind}:${issue.path}:${issue.message || ""}`
    if (!issueKeys.has(key) && out.issues.length < 100) {
      issueKeys.add(key)
      out.issues.push(issue)
    }
  }
  // This worker is a separate unprivileged container: no token, webhook, state
  // volume, Docker socket, or host mounts. Never execute probes in the controller.
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--disable-dev-shm-usage"],
  })
  try {
    const context = await browser.newContext({
      serviceWorkers: "block",
      ignoreHTTPSErrors: false,
    })
    await context.route("**/*", async (route) => {
      const r = route.request(),
        u = new URL(r.url()),
        kind = r.resourceType()
      if (!(await allowNetwork(r.url()))) {
        add({
          kind: "unexpected-resource",
          path: `${u.origin}${u.pathname}`,
          message: "Blocked non-public network request",
        })
        await route.abort()
        return
      }
      if (u.origin !== c.target) {
        origins.add(u.origin)
        if (
          ((["script", "stylesheet"].includes(kind) ||
            /\.wasm$/.test(u.pathname)) &&
            !c.externalScripts[u.href]) ||
          (kind === "document" && !c.frameOrigins.includes(u.origin))
        ) {
          add({
            kind: "unexpected-resource",
            path: `${u.origin}${u.pathname}`,
            message: "Unapproved executable resource or frame",
          })
          await route.abort()
          return
        }
      }
      await route.continue()
    })
    await context.routeWebSocket("**/*", async (socket) => {
      if (await allowNetwork(socket.url())) socket.connectToServer()
      else {
        add({
          kind: "unexpected-resource",
          path: new URL(socket.url()).origin,
          message: "Blocked non-public WebSocket",
        })
        socket.close()
      }
    })
    for (const route of c.routes) {
      const page = await context.newPage()
      const jobs = []
      page.on("pageerror", (error) =>
        add({ kind: "browser-error", path: route, message: safeError(error) }),
      )
      page.on("response", (response) => {
        if (jobs.length >= 1200) {
          add({ kind: "resource-limit", path: route })
          return
        }
        const job = (async () => {
          const u = new URL(response.url()),
            type = response.request().resourceType()
          const sameOrigin = u.origin === c.target
          const key =
            type === "document" && response.frame() === page.mainFrame()
              ? "/index.html"
              : u.pathname + u.search
          const expected = sameOrigin
            ? reference?.files[key]
            : c.externalScripts[u.href] && { sha256: c.externalScripts[u.href] }
          const executable =
            ["script", "stylesheet", "document"].includes(type) ||
            /\.(?:wasm|m?js)(?:\?|$)/.test(u.pathname) ||
            /(?:javascript|ecmascript|application\/wasm)/.test(
              response.headers()["content-type"] || "",
            )
          if (response.status() >= 400)
            add({
              kind: sameOrigin ? "fetch-failed" : "dependency-failed",
              path: sameOrigin ? key : u.origin,
              message: `HTTP ${response.status()}`,
            })
          if (sameOrigin && reference && executable && !expected)
            add({ kind: "unexpected-resource", path: key })
          if (
            !sameOrigin &&
            executable &&
            !expected &&
            !(type === "document" && c.frameOrigins.includes(u.origin))
          )
            add({
              kind: "unexpected-resource",
              path: u.origin + u.pathname,
              message: "External executable content has no approved hash",
            })
          if (!expected || response.status() !== 200) return
          try {
            const body = await response.body(),
              hash = sha256(body)
            if (body.length > 32 * 1024 * 1024)
              throw new Error("Browser response exceeds size limit")
            if (out.responses.length < 1500)
              out.responses.push({
                path: sameOrigin ? key : u.origin + u.pathname,
                sha256: hash,
              })
            if (hash !== expected.sha256)
              add({
                kind: "hash-mismatch",
                path: sameOrigin ? key : u.origin + u.pathname,
                expected: expected.sha256,
                actual: hash,
              })
          } catch (e) {
            add({ kind: "browser-error", path: key, message: safeError(e) })
          }
        })().catch((e) =>
          add({ kind: "browser-error", path: route, message: safeError(e) }),
        )
        jobs.push(job)
      })
      page.on("requestfailed", (r) => {
        const u = new URL(r.url())
        if (
          u.origin === c.target &&
          ["script", "stylesheet", "document"].includes(r.resourceType())
        )
          add({
            kind: "fetch-failed",
            path: u.pathname,
            message: "Browser resource failed",
          })
      })
      try {
        await page.goto(new URL(route, c.target).href, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        })
        await page.waitForFunction(
          () => document.querySelector("#root")?.innerText?.trim().length > 80,
          null,
          { timeout: 30000 },
        )
        await page.waitForTimeout(2500)
        const text = await page.locator("#root").innerText({ timeout: 3000 })
        if (
          /unexpected application error|something went wrong|page not found/i.test(
            text,
          )
        )
          add({
            kind: "browser-error",
            path: route,
            message: "Application error UI rendered",
          })
        out.routes.push({ path: route, rendered: true })
      } catch (e) {
        add({ kind: "browser-error", path: route, message: safeError(e) })
        out.routes.push({ path: route, rendered: false })
      }
      await page.close()
      await Promise.allSettled(jobs)
    }
    out.externalOrigins = [...origins].sort()
    out.completedAt = timestamp()
    return out
  } finally {
    await browser.close()
  }
}
