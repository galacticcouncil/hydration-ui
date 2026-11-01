import { readFile } from "node:fs/promises"

const token = (await readFile(process.env.SWARMPIT_TOKEN_FILE, "utf8"))
  .trim()
  .replace(/^Bearer\s+/i, "")
const endpoint = "https://swarmpit.play.hydration.cloud/api"
async function api(path, method = "GET", body) {
  const response = await fetch(`${endpoint}/${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok)
    throw new Error(`${method} ${path}: HTTP ${response.status}`)
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
const services = (await api("services")).filter(
  (s) =>
    s.serviceName.startsWith("ui-watchdog_") &&
    s.repository?.name === "galacticcouncil/hydration-ui-watchdog",
)
for (const s of services)
  console.log(
    JSON.stringify({
      name: s.serviceName,
      id: s.id,
      replicas: s.replicas,
      image: s.repository,
      status: s.status,
    }),
  )
const saved = await api("stacks/ui-watchdog/file")
const compose = saved.spec?.compose ?? saved.compose
if (typeof compose !== "string" || !compose.length)
  throw new Error("No saved stack compose")
const images = [...compose.matchAll(/^\s*image:\s*["']?([^\s"']+)/gm)].map(
  (m) => m[1],
)
console.log(
  JSON.stringify({
    savedImages: images,
    redacted: compose.includes("[REDACTED]"),
  }),
)
if (process.argv[2] === "deploy") {
  const image = process.env.WATCHDOG_IMAGE
  if (
    !/^galacticcouncil\/hydration-ui-watchdog:(?:zombie-fix-20261015-v\d+|[a-f0-9]{40})@sha256:[a-f0-9]{64}$/.test(
      image || "",
    )
  )
    throw new Error("Expected incident image digest")
  if (compose.includes("[REDACTED]"))
    throw new Error("Saved compose contains redacted values")
  let replacements = 0
  const updated = compose.replace(
    /(^\s*image:\s*)(["']?)(?:docker\.io\/)?galacticcouncil\/hydration-ui-watchdog(?=[:@\s"']|$)[^\s"']*\2/gm,
    (_, prefix, quote) => {
      replacements++
      return `${prefix}${quote}${image}${quote}`
    },
  )
  if (!replacements) throw new Error("No watchdog images in saved compose")
  await api("stacks/ui-watchdog", "POST", {
    name: "ui-watchdog",
    spec: { compose: updated },
  })
  console.log(JSON.stringify({ deployed: true, image, replacements }))
}
if (process.argv[2] === "verify") {
  for (const service of services.filter((s) => s.replicas > 0)) {
    const logs = await api(`services/${service.id}/logs?since=30m`)
    const text = typeof logs === "string" ? logs : JSON.stringify(logs)
    const counts = [
      ...text.replaceAll('\\"', '"').matchAll(/"processes":(\{[^}]+\})/g),
    ].map((m) => JSON.parse(m[1]))
    console.log(
      JSON.stringify({
        service: service.serviceName,
        recentProcessCounts: counts.slice(-3),
      }),
    )
  }
}
