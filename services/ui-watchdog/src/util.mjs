import { createHash } from "node:crypto"

export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex")
export const timestamp = () => new Date().toISOString()
export const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  )
export const safeError = (error) =>
  String(error?.message || error)
    .replace(/https?:\/\/[^\s"')]+/g, "[URL]")
    .replace(/(?:gh[pousr]_|github_pat_)[\w]+/g, "[redacted]")
    .slice(0, 400)

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const n = i++
        out[n] = await fn(items[n], n)
      }
    }),
  )
  return out
}

export async function responseBytes(response, maxBytes) {
  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel()
    throw new Error("Response exceeds size limit")
  }
  const chunks = []
  let size = 0
  for await (const chunk of response.body || []) {
    size += chunk.length
    if (size > maxBytes) throw new Error("Response exceeds size limit")
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function request(
  url,
  { timeoutMs = 20000, maxBytes = 32 * 1024 * 1024, ...options } = {},
) {
  // Keep the deadline active through body consumption, not just response headers.
  const response = await fetch(url, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  })
  const bytes = await responseBytes(response, maxBytes)
  return { status: response.status, headers: response.headers, bytes }
}
