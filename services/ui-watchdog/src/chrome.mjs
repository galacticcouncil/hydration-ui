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

// passing headers back, even unchanged, reorders them on the wire.
export async function continueChrome(route) {
  await route.continue()
}

export async function launchChrome(c, executablePath) {
  if (c.browserPool) return c.browserPool.acquire()
  return chromium.launch({
    channel: "chromium", // Full Chromium/new headless, not headless-shell.
    headless: true,
    executablePath,
    env: {
      ...process.env,
      XDG_CONFIG_HOME: "/tmp/chrome-config",
      XDG_CACHE_HOME: "/tmp/chrome-cache",
      LANG: "en_US.UTF-8",
      LANGUAGE: "en_US:en",
    },
    chromiumSandbox: Boolean(c.chromiumSandbox),
    proxy: browserProxy(c),
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-dev-shm-usage",
      "--lang=en-US",
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

const blankPage =
  '<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body></body></html>'

// how the vite build requests each file type; scripts are compiled, never run.
const requestAs = (path) =>
  /\.m?js$/.test(path)
    ? "script"
    : /\.css$/.test(path)
      ? "style"
      : /\.(?:woff2?|ttf|otf)$/.test(path)
        ? "font"
        : /\.(?:png|jpe?g|webp|svg|ico|avif|gif)$/.test(path)
          ? "image"
          : "fetch"

const requestFrom = (page, url) =>
  page.evaluate(
    ({ url, as }) => {
      if (as === "fetch") {
        fetch(url)
          .then((r) => r.arrayBuffer())
          .catch(() => {})
        return
      }
      const link = document.createElement("link")
      if (as === "script") link.rel = "modulepreload"
      else {
        link.rel = "preload"
        link.as = as
      }
      if (as !== "image") link.crossOrigin = ""
      link.href = url
      document.head.appendChild(link)
    },
    { url: url.href, as: requestAs(url.pathname) },
  )

async function readResponse(response, { timeoutMs, maxBytes }) {
  if (!response) throw new Error("Missing browser response")
  const headers = headersOf(await response.headersArray())
  if (Number(headers.get("content-length")) > maxBytes)
    throw new Error("Response exceeds size limit")
  const bytes = await deadline(response.body(), timeoutMs)
  if (bytes.length > maxBytes) throw new Error("Response exceeds size limit")
  return { status: response.status(), headers, bytes }
}

function headersOf(entries) {
  const headers = new Headers()
  for (const { name, value } of entries)
    try {
      headers.append(name, value)
    } catch {
      // a header node rejects must not keep the body from being hashed
    }
  return headers
}

// playwright drops page events for urls ending in /favicon.ico; read it over cdp.
function cdpResponse(page, href, { timeoutMs, maxBytes }) {
  const session = sessions.get(page)
  let id, response
  const listeners = {}
  const done = new Promise((resolve, reject) => {
    listeners["Network.requestWillBeSent"] = (e) => {
      if (!id && e.request.url === href) id = e.requestId
    }
    listeners["Network.responseReceived"] = (e) => {
      if (e.requestId === id) response = e.response
    }
    listeners["Network.loadingFinished"] = (e) => {
      if (e.requestId !== id) return
      if (!response) return reject(new Error("Missing browser response"))
      if (e.encodedDataLength > maxBytes)
        return reject(new Error("Response exceeds size limit"))
      session
        .send("Network.getResponseBody", { requestId: id })
        .then(({ body, base64Encoded }) => {
          const bytes = Buffer.from(body, base64Encoded ? "base64" : "utf8")
          if (bytes.length > maxBytes)
            throw new Error("Response exceeds size limit")
          resolve({
            status: response.status,
            headers: headersOf(
              Object.entries(response.headers).flatMap(([name, value]) =>
                String(value)
                  .split("\n")
                  .map((v) => ({ name, value: v })),
              ),
            ),
            bytes,
          })
        })
        .catch(reject)
    }
    listeners["Network.loadingFailed"] = (e) => {
      if (e.requestId === id) reject(new Error(e.errorText))
    }
  })
  for (const [event, fn] of Object.entries(listeners)) session.on(event, fn)
  const guarded = deadline(
    done,
    timeoutMs,
    "Browser response deadline exceeded",
  )
  guarded.catch(() => {})
  return {
    done: guarded,
    off: () => {
      for (const [event, fn] of Object.entries(listeners))
        session.off(event, fn)
    },
  }
}

// Hash the decoded bytes Chrome receives. Preloads never execute the fetched JS.
// Blank pages exist only in this browser; they are not server URLs.
export async function chromeTransport(
  c,
  { allowNetwork, executablePath } = {},
) {
  const browser = await launchChrome(c, executablePath)
  try {
    const context = await browser.newContext({ serviceWorkers: "block" })
    const blanks = new WeakSet(),
      pages = new Map()
    await chromeRoutes(context, async (route) => {
      const r = route.request(),
        blank = blanks.has(r.frame().page())
      if (blank && r.isNavigationRequest())
        return route.fulfill({
          status: 200,
          contentType: "text/html",
          body: blankPage,
        })
      if (allowNetwork && !(await allowNetwork(r.url()))) return route.abort()
      // Suppress parser-induced requests on document-only samples.
      if (!blank && !r.isNavigationRequest()) return route.abort()
      return continueChrome(route)
    })
    // one blank page per referer path, so requests carry that route's referer.
    const blankAt = (path) => {
      const url = new URL(path, c.target)
      if (url.origin !== new URL(c.target).origin)
        throw new Error("Referer must be on the target origin")
      const key = url.pathname + url.search
      if (!pages.has(key)) {
        const pending = (async () => {
          const page = await chromePage(context, c)
          blanks.add(page)
          page.once("close", () => {
            if (pages.get(key) === pending) pages.delete(key)
          })
          await page.goto(url.href)
          return page
        })()
        pages.set(key, pending)
        pending.catch(() => pages.delete(key))
      }
      return pages.get(key)
    }
    await blankAt("/")
    const transport = async (
      raw,
      {
        timeoutMs = c.timeoutMs || 20000,
        maxBytes = 32 * 1024 * 1024,
        referer = "/",
      } = {},
    ) => {
      const url = new URL(raw)
      const limits = { timeoutMs, maxBytes }
      if (
        /\.[a-z0-9]+$/i.test(url.pathname) &&
        !/\.html?$/.test(url.pathname)
      ) {
        const page = await blankAt(referer)
        if (/\/favicon\.ico$/.test(url.pathname)) {
          const reading = cdpResponse(page, url.href, limits)
          try {
            await requestFrom(page, url)
            return await reading.done
          } finally {
            reading.off()
          }
        }
        const waiting = page.waitForResponse((r) => r.url() === url.href, {
          timeout: timeoutMs,
        })
        waiting.catch(() => {})
        await requestFrom(page, url)
        return await readResponse(await waiting, limits)
      }
      const page = await chromePage(context, c)
      try {
        const session = await context.newCDPSession(page)
        await session.send("Emulation.setScriptExecutionDisabled", {
          value: true,
        })
        return await readResponse(
          await page.goto(url.href, {
            waitUntil: "commit",
            timeout: timeoutMs,
          }),
          limits,
        )
      } finally {
        await page.close()
      }
    }
    return { request: transport, close: () => browser.close() }
  } catch (e) {
    await browser.close()
    throw e
  }
}
