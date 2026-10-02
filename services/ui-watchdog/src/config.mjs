import { readFileSync } from "node:fs"
import { isIP } from "node:net"

export function config(env = process.env) {
  const url = (value, name) => {
    try {
      return new URL(value)
    } catch {
      throw new Error(`Invalid ${name}`)
    }
  }
  const secret = (key) =>
    env[`${key}_FILE`]
      ? readFileSync(env[`${key}_FILE`], "utf8").trim()
      : (env[key] || "").trim()
  const int = (key, fallback, min = 1, max = 86400) => {
    const n = Number(env[key] || fallback)
    if (!Number.isSafeInteger(n) || n < min || n > max)
      throw new Error(`Invalid ${key}`)
    return n
  }
  const target = url(
    env.TARGET_URL || "https://app.hydration.net",
    "TARGET_URL",
  )
  if (
    target.protocol !== "https:" ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    target.pathname !== "/"
  ) {
    throw new Error("TARGET_URL must be an HTTPS origin")
  }
  const repo = env.GITHUB_REPOSITORY || "galacticcouncil/hydration-ui"
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo))
    throw new Error("Invalid GITHUB_REPOSITORY")
  const branch = env.PRODUCTION_BRANCH || "production"
  if (!/^[\w./-]+$/.test(branch)) throw new Error("Invalid PRODUCTION_BRANCH")
  const webhook = secret("DISCORD_WEBHOOK_URL")
  if (webhook) {
    const u = url(webhook, "DISCORD_WEBHOOK_URL")
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      !["discord.com", "discordapp.com"].includes(u.hostname) ||
      !/^\/api(?:\/v\d+)?\/webhooks\/\d+\/[^/]+$/.test(u.pathname)
    ) {
      throw new Error("Invalid DISCORD_WEBHOOK_URL")
    }
  }
  const mention = env.DISCORD_MENTION || ""
  if (mention && !/^(?:@here|@everyone|<@!?\d+>|<@&\d+>)$/.test(mention))
    throw new Error("Invalid DISCORD_MENTION")
  const routes = JSON.parse(
    env.SMOKE_ROUTES || '["/trade/swap","/liquidity","/borrow","/portfolio"]',
  )
  if (
    !Array.isArray(routes) ||
    !routes.length ||
    routes.length > 10 ||
    routes.some((p) => typeof p !== "string" || !/^\/(?!\/)/.test(p))
  )
    throw new Error("Invalid SMOKE_ROUTES")
  const role = env.ROLE || "watchdog"
  const egressKind = env.EGRESS_KIND || "direct"
  if (!["direct", "tor", "proxy"].includes(egressKind))
    throw new Error("Invalid EGRESS_KIND")
  const proxyUrl = secret("PROXY_URL")
  if (proxyUrl) {
    const p = url(proxyUrl, "PROXY_URL")
    if (
      p.protocol !== "socks5h:" ||
      !p.hostname ||
      p.username ||
      p.password ||
      p.search ||
      p.hash ||
      (p.pathname && p.pathname !== "/")
    )
      throw new Error(
        "PROXY_URL must be a socks5h URL without credentials; keep credentials on the isolated gateway",
      )
  }
  const requireProxy = egressKind !== "direct"
  if (["observer", "browser"].includes(role) && requireProxy && !proxyUrl)
    throw new Error("This network path requires PROXY_URL")
  if (egressKind === "direct" && proxyUrl)
    throw new Error("A direct observer cannot have PROXY_URL")
  const expectedExitIp = env.EXPECTED_EXIT_IP || ""
  if (expectedExitIp && !isIP(expectedExitIp))
    throw new Error("Invalid EXPECTED_EXIT_IP")
  const defaults = [
    {
      id: "direct",
      url: env.BROWSER_URL || "http://browser:8080",
      kind: "direct",
    },
  ]
  if (env.MULTI_NETWORK === "true") {
    defaults.push(
      { id: "tor-de", url: "http://observer-tor-de:8080", kind: "tor" },
      { id: "tor-us", url: "http://observer-tor-us:8080", kind: "tor" },
    )
    if (env.NORDVPN_REPLICAS === "1")
      for (const n of [1, 2, 3])
        defaults.push({
          id: `nord-${n}`,
          url: `http://observer-nord-${n}:8080`,
          kind: "proxy",
        })
    if (env.WIREGUARD_REPLICAS === "1")
      defaults.push({
        id: "wireguard",
        url: "http://observer-wireguard:8080",
        kind: "proxy",
      })
  }
  const observers = JSON.parse(env.OBSERVERS_JSON || JSON.stringify(defaults))
  if (
    !Array.isArray(observers) ||
    !observers.length ||
    observers.length > 8 ||
    new Set(observers.map((o) => o?.id)).size !== observers.length
  )
    throw new Error("Invalid OBSERVERS_JSON")
  for (const o of observers) {
    if (
      !o ||
      !/^[a-z][a-z0-9-]{0,39}$/.test(o.id) ||
      !["direct", "tor", "proxy"].includes(o.kind)
    )
      throw new Error("Invalid observer identity")
    const endpoint = url(o.url, "observer URL")
    if (
      !["http:", "https:"].includes(endpoint.protocol) ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== "/"
    )
      throw new Error("Observer endpoints must be HTTP(S) origins")
  }
  if (env.OBSERVER_ID && !/^[a-z][a-z0-9-]{0,39}$/.test(env.OBSERVER_ID))
    throw new Error("Invalid OBSERVER_ID")
  if (
    env.USER_AGENT &&
    (env.USER_AGENT.length > 512 || /[\r\n]/.test(env.USER_AGENT))
  )
    throw new Error("Invalid USER_AGENT")
  for (const flag of ["NORDVPN_REPLICAS", "WIREGUARD_REPLICAS"])
    if (env[flag] && !["0", "1"].includes(env[flag]))
      throw new Error(`Invalid ${flag}`)
  return {
    role,
    target: target.origin,
    repo,
    branch,
    token: secret("GITHUB_TOKEN"),
    webhook,
    mention,
    dataDir: env.DATA_DIR || "./data",
    port: int("PORT", 8080, 1, 65535),
    pollSeconds: int("POLL_SECONDS", 30, 10),
    fullSeconds: int("FULL_AUDIT_SECONDS", 300, 30),
    browserSeconds: int("BROWSER_SECONDS", 300, 30),
    graceSeconds: int("ROLLOUT_GRACE_SECONDS", 900, 0),
    reminderSeconds: int("REMINDER_SECONDS", 3600, 60),
    retentionDays: int("RETENTION_DAYS", 90, 1, 3650),
    timeoutMs: int("REQUEST_TIMEOUT_MS", 20000, 1000, 120000),
    concurrency: int("FETCH_CONCURRENCY", 6, 1, 16),
    browserUrl: env.BROWSER_URL || "http://browser:8080",
    observers,
    observerId: env.OBSERVER_ID || "direct",
    proxyUrl,
    requireProxy,
    egressKind,
    expectedExitIp,
    userAgent:
      env.USER_AGENT ||
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    minDistinctEgress: int("MIN_DISTINCT_EGRESS", observers.length, 1, 8),
    nordToken: secret("NORDVPN_TOKEN"),
    nordCountry: env.NORDVPN_COUNTRY || "DE",
    nordRotateSeconds: int("NORDVPN_ROTATE_SECONDS", 3600, 300, 604800),
    wireguardPrivateKey: secret("WIREGUARD_PRIVATE_KEY"),
    wireguardPublicKey: env.WIREGUARD_PUBLIC_KEY || "",
    wireguardPresharedKey: secret("WIREGUARD_PRESHARED_KEY"),
    wireguardEndpoint: env.WIREGUARD_ENDPOINT || "",
    wireguardAddress: env.WIREGUARD_ADDRESS || "",
    wireguardDns: env.WIREGUARD_DNS || "1.1.1.1",
    workflow: "ui-watchdog-reference.yml",
    routes,
    externalScripts: JSON.parse(env.EXTERNAL_SCRIPT_HASHES || "{}"),
    frameOrigins: JSON.parse(env.ALLOWED_FRAME_ORIGINS || "[]"),
  }
}
