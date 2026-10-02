import { chromium } from "playwright"
import { sha256, safeError, timestamp } from "./util.mjs"
import { browserProxy } from "./transport.mjs"
import {
  EGRESS_CHECK_URL,
  publicNetworkPolicy,
  validateEgress,
} from "./network.mjs"
export { publicAddress, publicNetworkPolicy } from "./network.mjs"

export async function probeBrowser(
  c,
  reference,
  rootHash,
  {
    allowNetwork = publicNetworkPolicy({ remoteDns: Boolean(c.proxyUrl) }),
    executablePath,
    checkEgress = true,
  } = {},
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
    proxy: browserProxy(c),
    args: [
      "--disable-dev-shm-usage",
      "--disable-quic",
      "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
      ...(c.proxyUrl
        ? [
            `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE ${new URL(c.proxyUrl).hostname}`,
          ]
        : []),
    ],
  })
  try {
    const context = await browser.newContext({
      serviceWorkers: "block",
      ignoreHTTPSErrors: false,
      ...(c.userAgent ? { userAgent: c.userAgent } : {}),
    })
    let egressPage = null
    await context.route("**/*", async (route) => {
      const r = route.request(),
        u = new URL(r.url()),
        kind = r.resourceType()
      if (egressPage && r.frame().page() === egressPage) {
        if (r.url() === EGRESS_CHECK_URL && kind === "document")
          await route.continue()
        else await route.abort()
        return
      }
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
    if (checkEgress) {
      egressPage = await context.newPage()
      try {
        const r = await egressPage.goto(EGRESS_CHECK_URL, {
          waitUntil: "domcontentloaded",
          timeout: c.timeoutMs || 20000,
        })
        if (!r || r.status() !== 200)
          throw new Error("Browser egress check failed")
        out.egress = validateEgress(c, JSON.parse(await r.text()))
      } catch (e) {
        out.egress = { error: safeError(e), checkedAt: timestamp() }
      }
      await egressPage.close()
      egressPage = null
    }
    for (const route of c.routes) {
      const page = await context.newPage()
      const jobs = []
      page.on("pageerror", (error) =>
        add({
          kind: "browser-error",
          path: route,
          message: safeError(error),
        }),
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
            : c.externalScripts[u.href] && {
                sha256: c.externalScripts[u.href],
              }
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
            add({
              kind: "browser-error",
              path: key,
              message: safeError(e),
            })
          }
        })().catch((e) =>
          add({
            kind: "browser-error",
            path: route,
            message: safeError(e),
          }),
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
