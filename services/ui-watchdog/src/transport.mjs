import { request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"
import { SocksProxyAgent } from "socks-proxy-agent"
import { request } from "./util.mjs"

export function proxyAgent(proxy, timeout = 20000) {
  if (!proxy.startsWith("socks5h:"))
    throw new Error("A socks5h proxy is required for remote DNS")
  return new SocksProxyAgent(proxy, { keepAlive: true, timeout })
}

export function siteTransport(c) {
  if (c.requireProxy && !c.proxyUrl)
    throw new Error("This observer requires PROXY_URL")
  if (!c.proxyUrl) return request
  const agent = proxyAgent(c.proxyUrl, c.timeoutMs || 20000)
  return (
    raw,
    { timeoutMs = 20000, maxBytes = 32 * 1024 * 1024, headers = {} } = {},
  ) =>
    new Promise((resolve, reject) => {
      const url = new URL(raw)
      if (url.protocol !== "https:" && url.protocol !== "http:")
        return reject(new Error("Unsupported target protocol"))
      const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(
        url,
        {
          agent,
          headers: { ...headers, "accept-encoding": "identity" },
          signal: AbortSignal.timeout(timeoutMs),
        },
        (res) => {
          const chunks = []
          let size = 0
          // Request identity encoding and fail if an origin ignores it. This
          // avoids comparing compressed wire bytes or accepting decompression bombs.
          if (
            res.headers["content-encoding"] &&
            res.headers["content-encoding"] !== "identity"
          ) {
            res.destroy(new Error("Unexpected compressed proxy response"))
          }
          res.on("data", (chunk) => {
            size += chunk.length
            if (size > maxBytes)
              res.destroy(new Error("Response exceeds size limit"))
            else chunks.push(chunk)
          })
          res.on("error", reject)
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: new Headers(
                Object.entries(res.headers)
                  .filter(([, v]) => v !== undefined)
                  .map(([k, v]) => [k, String(v)]),
              ),
              bytes: Buffer.concat(chunks),
            }),
          )
        },
      )
      req.on("error", reject)
      req.end()
    })
}

export function browserProxy(c) {
  if (c.requireProxy && !c.proxyUrl)
    throw new Error("This observer requires PROXY_URL")
  if (!c.proxyUrl) return undefined
  const u = new URL(c.proxyUrl)
  if (u.protocol === "socks5h:" && (u.username || u.password))
    throw new Error(
      "Chromium requires an unauthenticated SOCKS gateway on an isolated network",
    )
  return {
    server: `${u.protocol === "socks5h:" ? "socks5:" : u.protocol}//${u.host}`,
    ...(u.username
      ? {
          username: decodeURIComponent(u.username),
          password: decodeURIComponent(u.password),
        }
      : {}),
  }
}
