import { readFileSync } from "node:fs"

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
  return {
    role: env.ROLE || "watchdog",
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
    workflow: "ui-watchdog-reference.yml",
    routes,
    externalScripts: JSON.parse(env.EXTERNAL_SCRIPT_HASHES || "{}"),
    frameOrigins: JSON.parse(env.ALLOWED_FRAME_ORIGINS || "[]"),
  }
}
