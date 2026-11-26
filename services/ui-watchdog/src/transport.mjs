import { createGunzip, createInflate, createBrotliDecompress } from "node:zlib"
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
          headers: { ...headers, "accept-encoding": "gzip, deflate, br" },
          signal: AbortSignal.timeout(timeoutMs),
        },
        (res) => {
          const chunks = []
          let size = 0
          const encoding = res.headers["content-encoding"]
          const decoder =
            encoding === "gzip"
              ? createGunzip()
              : encoding === "br"
                ? createBrotliDecompress()
                : encoding === "deflate"
                  ? createInflate()
                  : null
          if (encoding && encoding !== "identity" && !decoder) {
            res.destroy(new Error("Unsupported encoding"))
            return
          }
          const stream = decoder ? res.pipe(decoder) : res
          res.on("error", reject)
          stream.on("data", (chunk) => {
            size += chunk.length
            if (size > maxBytes) {
              stream.destroy(new Error("Response exceeds size limit"))
              res.destroy()
            } else chunks.push(chunk)
          })
          stream.on("error", reject)
          stream.on("end", () =>
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
