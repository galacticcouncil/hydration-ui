import { chromium } from "playwright"
import { browserProxy } from "./transport.mjs"

const policies = new WeakMap(),
  sessions = new WeakMap(),
  intercepted = new WeakSet()

// CDP Fetch interception does not force the cache-disabled request headers that
// Playwright's context.route() adds. All outgoing HTTP requests still pass policy.
async function intercept(page, handler) {
  if (intercepted.has(page)) return
  intercepted.add(page)
  const session = sessions.get(page)
  session.on("Fetch.requestPaused", async (e) => {
    let handled = false
    const send = async (method, args) => {
      handled = true
      await session.send(method, { requestId: e.requestId, ...args })
    }
    const request = {
      url: () => e.request.url,
      resourceType: () => e.resourceType.toLowerCase(),
      isNavigationRequest: () => e.resourceType === "Document",
      frame: () => ({ page: () => page }),
      allHeaders: async () =>
        Object.fromEntries(
          Object.entries(e.request.headers).map(([k, v]) => [
            k.toLowerCase(),
            v,
          ]),
        ),
    }
    try {
      await handler({
        request: () => request,
        continue: (options = {}) =>
          send(
            "Fetch.continueRequest",
            options.headers
              ? {
                  headers: Object.entries(options.headers).map(
                    ([name, value]) => ({ name, value }),
                  ),
                }
              : {},
          ),
        abort: () => send("Fetch.failRequest", { errorReason: "Aborted" }),
        fulfill: ({ status = 200, contentType = "text/html", body = "" }) =>
          send("Fetch.fulfillRequest", {
            responseCode: status,
            responseHeaders: [{ name: "content-type", value: contentType }],
            body: Buffer.from(body).toString("base64"),
          }),
      })
    } catch {
      if (!handled)
        await session
          .send("Fetch.failRequest", {
            requestId: e.requestId,
            errorReason: "Aborted",
          })
          .catch(() => {})
    }
  })
  await session.send("Fetch.enable", {
    patterns: [{ urlPattern: "*", requestStage: "Request" }],
  })
}

export async function chromeRoutes(context, handler) {
  policies.set(context, handler)
  for (const page of context.pages()) await intercept(page, handler)
}

export async function continueChrome(route) {
  // Playwright interception disables caching and otherwise adds these tells.
  // Preserve Chromium's generated navigation/client-hint headers and TLS.
  const headers = await route.request().allHeaders()
  delete headers.pragma
  delete headers["cache-control"]
  await route.continue({ headers })
}

export async function launchChrome(c, executablePath) {
  return chromium.launch({
    channel: "chromium", // Full Chromium/new headless, not headless-shell.
    headless: true,
    executablePath,
    env: {
      ...process.env,
      XDG_CONFIG_HOME: "/tmp/chrome-config",
      XDG_CACHE_HOME: "/tmp/chrome-cache",
    },
    chromiumSandbox: Boolean(c.chromiumSandbox),
    proxy: browserProxy(c),
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-quic",
      "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
      ...(c.proxyUrl
        ? [
            `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE ${new URL(c.proxyUrl).hostname}`,
          ]
        : []),
    ],
  })
}

export async function chromePage(context, c) {
  const page = await context.newPage()
  const session = await context.newCDPSession(page)
  sessions.set(page, session)
  const { product } = await session.send("Browser.getVersion")
  const version = product.split("/")[1],
    major = version.split(".")[0]
  const brands = [
    { brand: "Not_A Brand", version: "99" },
    { brand: "Chromium", version: major },
  ]
  await session.send("Emulation.setUserAgentOverride", {
    userAgent:
      c.userAgent ||
      `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`,
    acceptLanguage: "en-US,en;q=0.9",
    platform: "Linux x86_64",
    userAgentMetadata: {
      brands,
      fullVersionList: brands.map((b) => ({
        ...b,
        version: b.brand === "Chromium" ? version : "99.0.0.0",
      })),
      fullVersion: version,
      platform: "Linux",
      platformVersion: "6.8.0",
      architecture: "x86",
      bitness: "64",
      model: "",
      mobile: false,
      wow64: false,
    },
  })
  // Bound decoded network data before asking Playwright to materialize bodies.
  await session.send("Network.enable")
  await session.send("Network.setCacheDisabled", { cacheDisabled: false })
  const sizes = new Map()
  session.on("Network.dataReceived", (e) => {
    const n = (sizes.get(e.requestId) || 0) + e.dataLength
    sizes.set(e.requestId, n)
    if (n > 32 * 1024 * 1024) page.close().catch(() => {})
  })
  for (const event of ["Network.loadingFinished", "Network.loadingFailed"])
    session.on(event, (e) => sizes.delete(e.requestId))
  if (policies.has(context)) await intercept(page, policies.get(context))
  return page
}

export async function deadline(
  promise,
  ms,
  message = "Browser body deadline exceeded",
) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

// Hash the decoded bytes Chrome receives. Preloads never execute the fetched JS.
// The same-origin blank page exists only in this browser; it is not a server URL.
export async function chromeTransport(
  c,
  { allowNetwork, executablePath } = {},
) {
  const browser = await launchChrome(c, executablePath)
  try {
    const context = await browser.newContext({ serviceWorkers: "block" })
    const assets = await chromePage(context, c)
    let bootstrap = true
    await chromeRoutes(context, async (route) => {
      const r = route.request()
      if (bootstrap && r.frame().page() === assets && r.isNavigationRequest())
        return route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<!doctype html><html><head></head><body></body></html>",
        })
      if (allowNetwork && !(await allowNetwork(r.url()))) return route.abort()
      // Suppress parser-induced requests on document-only samples.
      if (r.frame().page() !== assets && !r.isNavigationRequest())
        return route.abort()
      return continueChrome(route)
    })
    await (
      await context.newCDPSession(assets)
    ).send("Network.setCacheDisabled", { cacheDisabled: false })
    await assets.goto(c.target)
    bootstrap = false
    const transport = async (
      raw,
      { timeoutMs = c.timeoutMs || 20000, maxBytes = 32 * 1024 * 1024 } = {},
    ) => {
      const url = new URL(raw)
      const script = /\.m?js$/.test(url.pathname),
        style = /\.css$/.test(url.pathname)
      const preload =
        /\.[a-z0-9]+$/i.test(url.pathname) && !/\.html?$/.test(url.pathname)
      const page = preload ? assets : await chromePage(context, c)
      try {
        if (!preload) {
          const session = await context.newCDPSession(page)
          await session.send("Emulation.setScriptExecutionDisabled", {
            value: true,
          })
        }
        let response
        if (preload) {
          const waiting = page.waitForResponse((r) => r.url() === url.href, {
            timeout: timeoutMs,
          })
          await page.evaluate(
            ({ url, as }) => {
              const link = document.createElement("link")
              link.rel = "preload"
              link.as = as
              link.href = url
              if (["font", "fetch"].includes(as)) link.crossOrigin = "anonymous"
              document.head.appendChild(link)
            },
            {
              url: url.href,
              as: script
                ? "script"
                : style
                  ? "style"
                  : /\.woff2?$/.test(url.pathname)
                    ? "font"
                    : /\.(?:png|jpe?g|webp|svg|ico|avif|gif)$/.test(
                          url.pathname,
                        )
                      ? "image"
                      : "fetch",
            },
          )
          response = await waiting
        } else
          response = await page.goto(url.href, {
            waitUntil: "commit",
            timeout: timeoutMs,
          })
        if (!response) throw new Error("Missing browser response")
        const headers = new Headers(await response.allHeaders())
        if (Number(headers.get("content-length")) > maxBytes)
          throw new Error("Response exceeds size limit")
        const bytes = await deadline(response.body(), timeoutMs)
        if (bytes.length > maxBytes)
          throw new Error("Response exceeds size limit")
        return { status: response.status(), headers, bytes }
      } finally {
        if (!preload) await page.close()
      }
    }
    return { request: transport, close: () => browser.close() }
  } catch (e) {
    await browser.close()
    throw e
  }
}
