import {
  evidence,
  headerIssues,
  integrityKinds,
  releaseWindow,
} from "./policy.mjs"
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
      let u
      try {
        u = new URL(attrs.src || attrs.href || "", origin)
      } catch {
        external.add("invalid-resource-url")
        return
      }
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
      accept: /\.m?js(?:\?|$)/.test(file)
        ? "*/*"
        : "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": /\.m?js(?:\?|$)/.test(file) ? "script" : "document",
      "sec-fetch-mode": /\.m?js(?:\?|$)/.test(file) ? "cors" : "navigate",
      "sec-fetch-site": file === "/" ? "none" : "same-origin",
    },
  })
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`)
  return {
    sha256: sha256(r.bytes),
    size: r.bytes.length,
    bytes: r.bytes,
    type: r.headers.get("content-type") || "",
    headers: Object.fromEntries(r.headers),
  }
}

export async function observe(
  c,
  references,
  { full = false, sample = null, trustedRoots = {} } = {},
) {
  const result = {
    at: timestamp(),
    full,
    issues: [],
    observed: {},
    documents: [],
    evidence: [],
    rootHash: null,
    matchedSha: null,
  }
  let root
  try {
    root = await siteFile(c, "/")
  } catch (e) {
    return { ...result, error: safeError(e) }
  }
  function document(actual) {
    const trusted =
      references.find((r) => r.files["/index.html"].sha256 === actual.sha256) ||
      (trustedRoots[actual.sha256]
        ? { sha: trustedRoots[actual.sha256] }
        : null)
    result.documents.push({
      sha256: actual.sha256,
      matchedSha: trusted?.sha || null,
    })
    result.issues.push(
      ...headerIssues(
        "/index.html",
        actual.headers,
        trusted?.headers || c.headerPolicy,
      ),
    )
    if (!trusted) {
      result.evidence.push(evidence("/index.html", actual))
      if (references.length)
        result.issues.push({
          kind: "hash-mismatch",
          path: "/",
          actual: actual.sha256,
          untrustedHtml: true,
        })
    }
  }
  document(root)
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
  result.matchedSha = ref?.sha || trustedRoots[root.sha256] || null
  result.full = Boolean(full && ref && !sample)
  result.scope = ref
    ? full
      ? "all-reference-files"
      : "html-and-entry-resources"
    : "observed-resources-without-trusted-reference"
  const resources = htmlResources(root.bytes.toString("utf8"), c.target)
  if (resources.all.length > 1000 || resources.external.length > 100)
    result.issues.push({ kind: "resource-limit", path: "/" })
  resources.all = resources.all.slice(0, 1000)
  resources.external = resources.external.slice(0, 100)
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
      ? (sample || Object.keys(ref.files)).filter((p) => p !== "/index.html")
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
      result.issues.push(
        ...headerIssues(file, actual.headers, ref?.headers || c.headerPolicy),
      )
      if (!expected || expected.sha256 !== actual.sha256)
        if (result.evidence.length < 32)
          result.evidence.push(evidence(file, actual, ref?.sha))
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
          referenceSha: ref.sha,
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
    document(after)
    result.racing = after.sha256 !== result.rootHash
  } catch (e) {
    result.issues.push({
      kind: "fetch-failed",
      path: "/",
      message: safeError(e),
    })
  }
  result.issues.sort(
    (a, b) =>
      Number(integrityKinds.has(b.kind)) - Number(integrityKinds.has(a.kind)) ||
      a.path.localeCompare(b.path),
  )
  result.issues = result.issues.slice(0, 1000)
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
  referenceStatus,
  referenceCount,
  pendingSeconds = 1200,
  raceCount = 0,
  flapping = false,
  extraIssues = [],
}) {
  const out = (state, reasons) => ({ state, reasons })
  const pending = releaseWindow(source, referenceStatus, now, pendingSeconds)
  // Each check carries evidence against its own reference. Later HTML or a
  // racing audit must never discard an earlier mismatch.
  const issues = [
    ...(probe?.issues || []),
    ...(audit?.issues || []),
    ...(browser?.issues || []),
    ...extraIssues,
  ]
  const unavailableReference = [
    "failed",
    "missing",
    "error",
    "unconfigured",
  ].includes(referenceStatus?.state)
  const actionable = issues.filter(
    (i) => !(i.untrustedHtml && (pending || unavailableReference)),
  )
  if (actionable.some((i) => integrityKinds.has(i.kind)))
    return out("integrity_alert", [
      "Live content differs from its trusted build or reviewed resource/header policy",
    ])
  if (flapping || raceCount >= 3)
    return out("integrity_alert", [
      flapping
        ? "Observed release sequence returned to an earlier document"
        : "Content keeps changing within individual checks",
    ])
  if (referenceCount === 0)
    return out("protection_inactive", [
      "Integrity protection inactive: no attested reference is available",
    ])
  if (unavailableReference)
    return out("reference_failed", [
      "Production reference is unavailable; integrity protection is incomplete",
    ])
  if (pending)
    return out("reference_pending", [
      "Production reference is building; observations are retained for retrospective verification",
    ])
  if (probe?.error) return out("down", [probe.error])
  if (!probe) return out("starting", ["First observation is pending"])
  const validAudit =
    audit?.matchedSha === probe.matchedSha && audit?.rootHash === probe.rootHash
  const validBrowser =
    browser?.matchedSha === probe.matchedSha &&
    browser?.rootHash === probe.rootHash
  if (probe.racing || (validAudit && audit?.racing))
    return out("unverified", [
      "Trusted document changed during verification; retrying",
    ])
  if (
    [
      ...(probe.issues || []),
      ...(validAudit ? audit.issues || [] : []),
      ...(validBrowser ? browser.issues || [] : []),
    ].some((i) => i.kind !== "external-origin")
  )
    return out("degraded", ["Asset or browser checks failed"])
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
