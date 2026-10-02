import { randomInt } from "node:crypto"
import {
  launchChrome,
  chromePage,
  deadline,
  continueChrome,
  chromeRoutes,
} from "./chrome.mjs"
import { evidence, headerIssues, sampledRoutes } from "./policy.mjs"
import { sha256, safeError, timestamp } from "./util.mjs"
import {
  EGRESS_CHECK_URLS,
  checkEgress as verifyEgress,
  publicNetworkPolicy,
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
    egressChecker = verifyEgress,
    references = reference ? [reference] : [],
    trustedRoots = {},
  } = {},
) {
  const out = {
    matchedSha: reference?.sha || null,
    rootHash,
    issues: [],
    routes: [],
    externalOrigins: [],
    responses: [],
    evidence: [],
    documents: [],
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
  const browser = await launchChrome(c, executablePath)
  try {
    const context = await browser.newContext({
      serviceWorkers: "block",
      ignoreHTTPSErrors: false,
    })
    let egressPage = null
    await chromeRoutes(context, async (route) => {
      const r = route.request(),
        u = new URL(r.url()),
        kind = r.resourceType()
      if (egressPage && r.frame().page() === egressPage) {
        if (EGRESS_CHECK_URLS.includes(r.url()) && kind === "document")
          await continueChrome(route)
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
      await continueChrome(route)
    })
    await context.routeWebSocket("**/*", async (socket) => {
      origins.add(new URL(socket.url()).origin)
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
      egressPage = await chromePage(context, c)
      try {
        out.egress = await egressChecker(c, async (url, { timeoutMs }) => {
          const r = await egressPage.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: timeoutMs,
          })
          return {
            status: r?.status(),
            bytes: r ? await deadline(r.body(), timeoutMs) : Buffer.alloc(0),
          }
        })
      } catch (e) {
        out.egress = { error: safeError(e), checkedAt: timestamp() }
      }
      await egressPage.close()
      egressPage = null
    }
    const routes = [...c.routes].sort(() => Math.random() - 0.5)
    if (c.sampleRoutes) routes.push(...sampledRoutes(reference, c.routes))
    for (const route of [...new Set(routes)]) {
      const page = await chromePage(context, c)
      const jobs = []
      const pending = new Set()
      const tracked = (r) => {
        const u = new URL(r.url())
        return (
          ["script", "stylesheet", "document", "font"].includes(
            r.resourceType(),
          ) ||
          (u.origin === c.target &&
            /\.(?:m?js|wasm|css|json|bin)(?:$|\?)/.test(u.pathname))
        )
      }
      page.on("request", (r) => {
        if (tracked(r)) pending.add(r)
      })
      page.on("requestfinished", (r) => pending.delete(r))
      page.on("requestfailed", (r) => pending.delete(r))
      const drain = async () =>
        deadline(
          (async () => {
            let count
            do {
              count = jobs.length
              await Promise.allSettled(jobs)
              await page.waitForTimeout(100)
            } while (count !== jobs.length || pending.size)
          })(),
          c.timeoutMs || 30000,
        )

      let documentJob = Promise.resolve(),
        pageReference = reference,
        pageRoot = rootHash
      page.on("pageerror", (error) =>
        add({
          kind: "browser-error",
          path: route,
          message: safeError(error),
        }),
      )
      const onResponse = (response) => {
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
          const mainDocument =
            type === "document" && response.frame() === page.mainFrame()
          if (!mainDocument) await documentJob
          const boundReference = pageReference,
            boundRoot = pageRoot
          const expected = sameOrigin
            ? pageReference?.files[key]
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
              path: sameOrigin ? (mainDocument ? u.pathname : key) : u.origin,
              message: `HTTP ${response.status()}`,
            })
          if (
            sameOrigin &&
            pageReference &&
            executable &&
            !expected &&
            !mainDocument
          )
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
          if ((!expected && !executable) || response.status() !== 200) return
          try {
            const body = await response.body(),
              hash = sha256(body)
            if (body.length > 32 * 1024 * 1024)
              throw new Error("Browser response exceeds size limit")
            const actual = {
              sha256: hash,
              size: body.length,
              bytes: body,
              headers: await response.allHeaders(),
              type: response.headers()["content-type"] || "",
            }
            if (mainDocument) {
              pageRoot = hash
              pageReference =
                references.find(
                  (r) => r.files["/index.html"].sha256 === hash,
                ) || null
              const trusted = pageReference?.sha || trustedRoots[hash] || null
              out.documents.push({ sha256: hash, matchedSha: trusted })
              if (!trusted && references.length)
                add({
                  kind: "hash-mismatch",
                  path: route,
                  actual: hash,
                  untrustedHtml: true,
                })
            }
            if (sameOrigin)
              for (const issue of headerIssues(
                key,
                actual.headers,
                pageReference?.headers || c.headerPolicy,
              ))
                add(issue)
            if (
              (!expected || hash !== expected.sha256) &&
              out.evidence.length < 32
            )
              out.evidence.push(evidence(key, actual, pageReference?.sha))
            if (out.responses.length < 1500)
              out.responses.push({
                path: sameOrigin ? key : u.origin + u.pathname,
                sha256: hash,
                size: body.length,
                rootHash: mainDocument ? hash : boundRoot,
                referenceSha: mainDocument
                  ? pageReference?.sha || null
                  : boundReference?.sha || null,
              })
            if (!mainDocument && expected && hash !== expected.sha256)
              add({
                kind: "hash-mismatch",
                path: sameOrigin ? key : u.origin + u.pathname,
                expected: expected.sha256,
                actual: hash,
                referenceSha: pageReference?.sha,
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
        if (
          response.request().resourceType() === "document" &&
          response.frame() === page.mainFrame()
        )
          documentJob = job
        jobs.push(job)
      }
      page.on("response", onResponse)
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
        const destination = new URL(route, c.target).href
        // Exercise a real link navigation in addition to direct visits. The
        // source is same-origin so Chrome supplies navigation/referrer headers.
        if (c.sampleRoutes) {
          await page.goto(c.target, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          })
          await page.waitForTimeout(c.settleMs ?? 1500)
          await drain()
          await page.evaluate((href) => {
            const a = document.createElement("a")
            a.href = href
            a.id = "probe-navigation"
            a.textContent = "Continue"
            document.body.append(a)
          }, destination)
          await Promise.all([
            page.waitForNavigation({
              waitUntil: "domcontentloaded",
              timeout: 30000,
            }),
            page.locator("#probe-navigation").click(),
          ])
        } else
          await page.goto(destination, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          })
        if (c.routes.includes(route))
          await page.waitForFunction(
            () =>
              document.querySelector("#root")?.innerText?.trim().length > 80,
            null,
            { timeout: 30000 },
          )
        await page.waitForTimeout(c.settleMs ?? randomInt(1500, 3000))
        const text = c.routes.includes(route)
          ? await page.locator("#root").innerText({ timeout: 3000 })
          : ""
        if (
          c.routes.includes(route) &&
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
      try {
        await drain()
      } catch (e) {
        add({ kind: "browser-error", path: route, message: safeError(e) })
      }
      page.off("response", onResponse)
      await page.close()
    }
    out.externalOrigins = [...origins].sort()
    for (const origin of out.externalOrigins)
      if (c.allowedOrigins?.length && !c.allowedOrigins.includes(origin))
        add({
          kind: "external-origin",
          path: origin,
          message: "New data or WebSocket origin outside the reviewed baseline",
        })
    out.completedAt = timestamp()
    return out
  } finally {
    await browser.close()
  }
}
