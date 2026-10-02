import { sha256 } from "./util.mjs"
import { randomBytes, randomInt } from "node:crypto"

export function sampledRoutes(reference, configured = []) {
  const candidates = [
    ...new Set([
      ...(reference?.routes || []),
      ...configured,
      "/submit-transaction",
      "/stats",
      "/referrals",
      "/trade/dca",
      "/trade/otc",
      "/wallet",
      "/xcm",
    ]),
  ].filter((p) => !p.includes("$") && p !== "/")
  return [
    candidates[randomInt(candidates.length)],
    `/${randomBytes(6).toString("hex")}`,
    Math.random() < 0.5
      ? "/?utm_source=androidappinstallbanner"
      : `/unknown/${randomBytes(8).toString("hex")}`,
  ].sort(() => Math.random() - 0.5)
}

export const integrityKinds = new Set([
  "hash-mismatch",
  "unexpected-resource",
  "resource-limit",
  "header-policy",
  "release-flapping",
  "persistent-race",
  "evidence-overflow",
])

export function headerIssues(path, headers, policy) {
  if (!policy) return []
  const expected = { ...policy.default, ...policy.paths?.[path] }
  const normalize = (s) =>
    s == null
      ? null
      : s
          .toLowerCase()
          .split(",")
          .map((v) => v.trim())
          .sort()
          .join(",")
  return Object.entries(expected).flatMap(([name, value]) => {
    const actual = headers.get ? headers.get(name) : (headers[name] ?? null)
    return normalize(actual) === normalize(value)
      ? []
      : [
          {
            kind: "header-policy",
            path,
            header: name,
            expected: value,
            actual: actual?.slice(0, 1024) ?? null,
            message: `Response header ${name} differs from the reviewed policy`,
          },
        ]
  })
}

// Include neither attacker-controlled bytes nor rotating paths in an incident key.
export function incidentFingerprint(assessment, observers = []) {
  return sha256(
    JSON.stringify([
      assessment.state,
      observers
        .filter((o) => o.state === "integrity_alert")
        .map((o) => o.id)
        .sort(),
    ]),
  )
}

export function shouldNotify(
  assessment,
  observers,
  previous,
  now,
  verifiedSince,
) {
  if (assessment.state === "starting") return false
  if (
    previous.state === "integrity_alert" &&
    (assessment.state !== "verified" ||
      !verifiedSince ||
      now - verifiedSince < 60000)
  )
    return false
  return previous.fingerprint !== incidentFingerprint(assessment, observers)
}

export function dailyHeartbeatDue(state, last, now = Date.now()) {
  return state === "verified" && now - last >= 86400000
}

// Also classify jobs that started before an artifact arrived but finish after it.
// Each response is bound to the document it actually loaded under.
export function reconcileEvidence(result, references) {
  if (!result) return
  const roots = new Map(
    references.map((r) => [r.files["/index.html"].sha256, r]),
  )
  result.issues = (result.issues || []).filter(
    (i) => !(i.untrustedHtml && roots.has(i.actual)),
  )
  if (roots.has(result.rootHash))
    result.matchedSha = roots.get(result.rootHash).sha
  for (const d of result.documents || []) {
    d.matchedSha = roots.get(d.sha256)?.sha || null
    if (
      !d.matchedSha &&
      references.length &&
      !result.issues.some((i) => i.untrustedHtml && i.actual === d.sha256)
    )
      result.issues.push({
        kind: "hash-mismatch",
        path: "/index.html",
        actual: d.sha256,
        untrustedHtml: true,
      })
  }
  const samples = [
    ...Object.entries(result.observed || {}).map(([path, f]) => ({
      path,
      ...f,
      rootHash: result.rootHash,
    })),
    ...(result.responses || []),
  ]
  for (const sample of samples) {
    const ref = roots.get(sample.rootHash || result.rootHash)
    if (!ref) continue
    const expected = ref.files[sample.path]
    // External resources use their separately approved hashes.
    if (!sample.path.startsWith("/")) continue
    if (sample.path === "/index.html" && roots.has(sample.sha256)) continue
    if (expected?.sha256 === sample.sha256) continue
    const issue = {
      kind: expected ? "hash-mismatch" : "unexpected-resource",
      path: sample.path,
      actual: sample.sha256,
      expected: expected?.sha256,
      referenceSha: ref.sha,
      trustedDocument: Boolean(
        sample.type?.includes("text/html") && roots.has(sample.sha256),
      ),
    }
    if (
      !result.issues.some(
        (i) =>
          i.kind === issue.kind &&
          i.path === issue.path &&
          i.actual === issue.actual,
      )
    )
      result.issues.push(issue)
  }
}

export function evidence(path, actual, referenceSha = null) {
  return {
    path,
    sha256: actual.sha256,
    size: actual.size,
    referenceSha,
    headers: Object.fromEntries(
      Object.entries(actual.headers || {})
        .slice(0, 24)
        .map(([k, v]) => [k, String(v).slice(0, 1024)]),
    ),
    // HTML/JS only. Bodies are untrusted evidence, never executed or served as HTML.
    body: /(?:html|javascript|ecmascript)/.test(actual.type || "")
      ? actual.bytes?.subarray(0, 65536).toString("base64")
      : undefined,
    truncated: actual.size > 65536,
  }
}

export function releaseWindow(source, referenceStatus, now, seconds = 1200) {
  return (
    referenceStatus?.state === "building" &&
    referenceStatus.sha === source?.sha &&
    now - source.firstSeen < seconds * 1000
  )
}
