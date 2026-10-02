import { parse } from "parse5"
import { mapLimit, request, safeError, sha256, timestamp } from "./util.mjs"

export function htmlResources(html, origin) {
  const all = new Set(),
    quick = new Set(),
    external = new Set()
  function walk(node) {
    const attrs = Object.fromEntries(
      (node.attrs || []).map((a) => [a.name, a.value]),
    )
    const isScript = node.tagName === "script" && attrs.src
    const isLink =
      node.tagName === "link" &&
      /^(?:stylesheet|modulepreload|preload)$/.test(attrs.rel)
    if (isScript || isLink) {
      const u = new URL(attrs.src || attrs.href || "", origin)
      if (u.origin !== origin) external.add(u.href)
      else {
        const name = u.pathname + u.search
        all.add(name)
        if (isScript || attrs.rel === "stylesheet") quick.add(name)
      }
    }
    for (const child of node.childNodes || []) walk(child)
  }
  walk(parse(html))
  return {
    all: [...all].sort(),
    quick: [...quick].sort(),
    external: [...external].sort(),
  }
}

async function siteFile(c, file) {
  const r = await (c.siteRequest || request)(new URL(file, c.target), {
    timeoutMs: c.timeoutMs,
    headers: {
      "user-agent":
        c.userAgent ||
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  })
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`)
  return {
    sha256: sha256(r.bytes),
    size: r.bytes.length,
    bytes: r.bytes,
    type: r.headers.get("content-type") || "",
  }
}

export async function observe(c, references, { full = false } = {}) {
  const result = {
    at: timestamp(),
    full,
    issues: [],
    observed: {},
    rootHash: null,
    matchedSha: null,
  }
  let root
  try {
    root = await siteFile(c, "/")
  } catch (e) {
    return { ...result, error: safeError(e) }
  }
  result.rootHash = root.sha256
  result.observed["/index.html"] = { sha256: root.sha256, size: root.size }
  if (!root.type.includes("text/html"))
    result.issues.push({
      kind: "content-type",
      path: "/",
      message: "Expected HTML",
    })
  const ref = references.find(
    (r) => r.files["/index.html"].sha256 === root.sha256,
  )
  result.matchedSha = ref?.sha || null
  result.full = Boolean(full && ref)
  result.scope = ref
    ? full
      ? "all-reference-files"
      : "html-and-entry-resources"
    : "observed-resources-without-trusted-reference"
  if (!ref && references.length)
    result.issues.push({
      kind: "hash-mismatch",
      path: "/",
      actual: root.sha256,
      message: "HTML matches none of the trusted reference builds",
    })
  const resources = htmlResources(root.bytes.toString("utf8"), c.target)
  result.resources = resources
  for (const url of resources.external) {
    if (!c.externalScripts[url])
      result.issues.push({
        kind: "unexpected-resource",
        path: url,
        message: "External resource is not in approved policy",
      })
  }
  const paths = full
    ? ref
      ? Object.keys(ref.files)
      : resources.all.slice(0, 1000)
    : resources.quick.slice(0, 32)
  const deadline = Date.now() + 120000
  if (resources.quick.length > 32 && !ref)
    result.issues.push({
      kind: "resource-limit",
      path: "/",
      message: "Untrusted page exceeds probe limit",
    })
  await mapLimit(paths, c.concurrency, async (file) => {
    if (!file.startsWith("/") || file.startsWith("//")) return
    if (Date.now() > deadline) {
      result.issues.push({
        kind: "fetch-failed",
        path: file,
        message: "Complete scan exceeded time budget",
      })
      return
    }
    try {
      const actual = await siteFile(c, file)
      result.observed[file] = { sha256: actual.sha256, size: actual.size }
      const expected = ref?.files[file]
      if (ref && !expected)
        result.issues.push({ kind: "unexpected-resource", path: file })
      else if (
        expected &&
        (expected.sha256 !== actual.sha256 || expected.size !== actual.size)
      ) {
        result.issues.push({
          kind: "hash-mismatch",
          path: file,
          expected: expected.sha256,
          actual: actual.sha256,
        })
      }
      if (
        /\.m?js(?:\?|$)/.test(file) &&
        !/(?:java|ecma)script/.test(actual.type)
      )
        result.issues.push({
          kind: "content-type",
          path: file,
          message: "JavaScript has incorrect MIME type",
        })
    } catch (e) {
      result.issues.push({
        kind: "fetch-failed",
        path: file,
        message: safeError(e),
      })
    }
  })
  if (ref) {
    for (const file of resources.all)
      if (!ref.files[file])
        result.issues.push({ kind: "unexpected-resource", path: file })
  }
  try {
    const after = await siteFile(c, "/")
    result.racing = after.sha256 !== result.rootHash
  } catch (e) {
    result.issues.push({
      kind: "fetch-failed",
      path: "/",
      message: safeError(e),
    })
  }
  result.issues.sort((a, b) => a.path.localeCompare(b.path))
  result.filesChecked = Object.keys(result.observed).length
  result.bytesChecked = Object.values(result.observed).reduce(
    (n, f) => n + f.size,
    0,
  )
  result.completedAt = timestamp()
  return result
}

export function assess({
  probe,
  audit,
  browser,
  source,
  sourceFresh = true,
  now = Date.now(),
  graceSeconds = 900,
  maxAuditAge = 900000,
  maxBrowserAge = 900000,
}) {
  const out = (state, reasons) => ({ state, reasons })
  if (probe?.error) return out("down", [probe.error])
  if (!probe) return out("starting", ["First observation is pending"])
  if (probe.racing || audit?.racing)
    return out("unverified", ["Release changed during verification; retrying"])
  const validAudit =
    audit?.matchedSha === probe.matchedSha && audit?.rootHash === probe.rootHash
  const validBrowser =
    browser?.matchedSha === probe.matchedSha &&
    browser?.rootHash === probe.rootHash
  const issues = [
    ...(probe.issues || []),
    ...(validAudit ? audit.issues : []),
    ...(validBrowser ? browser.issues : []),
  ]
  if (
    issues.some((i) =>
      ["hash-mismatch", "unexpected-resource", "resource-limit"].includes(
        i.kind,
      ),
    )
  )
    return out("integrity_alert", [
      "Live content differs from the trusted build or executable-resource policy",
    ])
  if (issues.length) return out("degraded", ["Asset or browser checks failed"])
  if (!probe.matchedSha)
    return out("unverified", ["No trusted reference matches the live HTML"])
  if (!source || !sourceFresh)
    return out("unverified", ["Cannot confirm the current production branch"])
  if (probe.matchedSha !== source.sha) {
    if (now - source.firstSeen < graceSeconds * 1000)
      return out("deployment_pending", [
        "A known previous release is live during the rollout window",
      ])
    return out("stale_deployment", [
      "Live release does not match production after the rollout window",
    ])
  }
  if (
    !validAudit ||
    !audit.full ||
    now - Date.parse(audit.completedAt) > maxAuditAge
  )
    return out("unverified", ["A complete, fresh asset audit is required"])
  if (
    !validBrowser ||
    !browser.completedAt ||
    now - Date.parse(browser.completedAt) > maxBrowserAge
  )
    return out("unverified", ["A fresh browser check is required"])
  return out("verified", [
    "Observed files match the independent production build; browser checks passed",
  ])
}
