import { createServer } from "node:http"
import { spawn } from "node:child_process"
import { randomInt } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { isIP } from "node:net"
import {
  EGRESS_CHECK_URL,
  publicAddress,
  publicHost,
  validateEgress,
} from "./network.mjs"
import { siteTransport } from "./transport.mjs"
import { responseBytes, timestamp } from "./util.mjs"

// Keep credential retrieval separate from the generic observer HTTP transport.
// Only this fixed HTTPS origin may supply a key, and redirects are rejected.
async function nordRequest(url, { headers, timeoutMs, maxBytes }) {
  if (!url.startsWith("https://api.nordvpn.com/v1/"))
    throw new Error("Invalid NordVPN API origin")
  const response = await fetch(url, {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
  })
  return {
    status: response.status,
    bytes: await responseBytes(response, maxBytes),
  }
}

const key = (value) =>
  typeof value === "string" &&
  /^[A-Za-z0-9+/]{43}=$/.test(value) &&
  Buffer.from(value, "base64").length === 32

export function wireguardConfig(connection) {
  const {
    privateKey,
    publicKey,
    presharedKey = "",
    endpoint,
    address,
    dns,
  } = connection
  if (
    !key(privateKey) ||
    !key(publicKey) ||
    (presharedKey && !key(presharedKey))
  )
    throw new Error("Invalid WireGuard key")
  if (
    [endpoint, address, dns].some(
      (v) => typeof v !== "string" || /[\r\n\x00]/.test(v),
    )
  )
    throw new Error("Invalid WireGuard configuration field")
  let u
  try {
    u = new URL(`udp://${endpoint}`)
  } catch {
    throw new Error("Invalid WireGuard endpoint")
  }
  if (
    !publicHost(u.hostname) ||
    !u.port ||
    u.username ||
    u.password ||
    !["", "/"].includes(u.pathname) ||
    u.search ||
    u.hash
  )
    throw new Error("Invalid WireGuard endpoint")
  if (
    !address ||
    address.split(",").some((a) => {
      const [ip, mask, extra] = a.trim().split("/")
      return (
        extra !== undefined ||
        !isIP(ip) ||
        !/^\d+$/.test(mask || "") ||
        Number(mask) < 1 ||
        Number(mask) > (isIP(ip) === 4 ? 32 : 128)
      )
    })
  )
    throw new Error("Invalid WireGuard interface address")
  if (!dns || dns.split(",").some((ip) => !isIP(ip.trim())))
    throw new Error("WireGuard DNS must contain IP addresses")
  return `[Interface]\nAddress = ${address}\nPrivateKey = ${privateKey}\nDNS = ${dns}\nMTU = 1420\n\n[Peer]\nPublicKey = ${publicKey}\n${presharedKey ? `PresharedKey = ${presharedKey}\n` : ""}Endpoint = ${endpoint}\nAllowedIPs = 0.0.0.0/0, ::/0\nPersistentKeepalive = 25\n\n[Socks5]\nBindAddress = 0.0.0.0:9050\n`
}

export async function nordConnection(
  c,
  { api = nordRequest, previousHostname = "", privateKey = "" } = {},
) {
  if (!/^[A-Z]{2}$/.test(c.nordCountry))
    throw new Error("NORDVPN_COUNTRY must be a two-letter country code")
  const get = async (suffix, headers = {}) => {
    const r = await api(`https://api.nordvpn.com/v1/${suffix}`, {
      headers,
      timeoutMs: 20000,
      maxBytes: 2 * 1024 * 1024,
    })
    if (r.status !== 200)
      throw new Error(`NordVPN API returned HTTP ${r.status}`)
    return JSON.parse(r.bytes)
  }
  if (!privateKey) {
    if (!c.nordToken)
      throw new Error("Set NORDVPN_TOKEN for the NordVPN gateways")
    const credentials = await get("users/services/credentials", {
      authorization: `Basic ${Buffer.from(`token:${c.nordToken}`).toString("base64")}`,
    })
    privateKey = credentials.nordlynx_private_key
    if (!key(privateKey))
      throw new Error("NordVPN did not return a WireGuard key")
  }
  const countries = await get("servers/countries")
  const country = countries.find((x) => x.code === c.nordCountry)
  if (!Number.isSafeInteger(country?.id))
    throw new Error("Unknown NordVPN country")
  const query = new URLSearchParams({
    limit: "10",
    "filters[country_id]": String(country.id),
    "filters[servers_technologies][identifier]": "wireguard_udp",
  })
  const candidates = (await get(`servers/recommendations?${query}`)).filter(
    (s) =>
      /^[a-z]{2}\d+\.nordvpn\.com$/.test(s.hostname) &&
      publicAddress(s.station) &&
      s.locations?.some((l) => l.country?.code === c.nordCountry) &&
      s.technologies?.some(
        (t) =>
          t.identifier === "wireguard_udp" &&
          t.metadata?.some((m) => m.name === "public_key" && key(m.value)),
      ),
  )
  const alternatives = candidates.filter((s) => s.hostname !== previousHostname)
  const pool = alternatives.length ? alternatives : candidates
  if (!pool.length)
    throw new Error("No suitable NordVPN WireGuard server is available")
  const server = pool[randomInt(pool.length)]
  const publicKey = server.technologies
    .find((t) => t.identifier === "wireguard_udp")
    .metadata.find((m) => m.name === "public_key").value
  return {
    privateKey,
    publicKey,
    endpoint: `${isIP(server.station) === 6 ? `[${server.station}]` : server.station}:51820`,
    address: "10.5.0.2/32",
    dns: "103.86.96.100, 103.86.99.100",
    hostname: server.hostname,
    country: c.nordCountry,
  }
}

export async function serveVpn(c) {
  let child,
    connection,
    checking = false,
    health = { ready: false },
    stopping = false
  const tunnelRequest = siteTransport({
    proxyUrl: "socks5h://127.0.0.1:9050",
    requireProxy: true,
  })
  const server = createServer((req, res) => {
    if (req.method !== "GET" || req.url !== "/healthz")
      return res.writeHead(404).end()
    res
      .writeHead(health.ready ? 200 : 503, {
        "content-type": "application/json",
      })
      .end(JSON.stringify(health))
  }).listen(c.port, "0.0.0.0")
  await mkdir("/tmp/wireproxy", { recursive: true, mode: 0o700 })
  async function start() {
    const next =
      c.role === "nordvpn"
        ? await nordConnection(c, {
            previousHostname: connection?.hostname,
            privateKey: connection?.privateKey,
          })
        : {
            privateKey: c.wireguardPrivateKey,
            publicKey: c.wireguardPublicKey,
            presharedKey: c.wireguardPresharedKey,
            endpoint: c.wireguardEndpoint,
            address: c.wireguardAddress,
            dns: c.wireguardDns,
          }
    const config = wireguardConfig(next)
    if (child && child.exitCode === null && child.signalCode === null) {
      const old = child
      await new Promise((resolve) => {
        const deadline = setTimeout(() => old.kill("SIGKILL"), 10000)
        old.once("exit", () => {
          clearTimeout(deadline)
          resolve()
        })
        old.kill("SIGTERM")
      })
    }
    health = { ready: false }
    await writeFile("/tmp/wireproxy/client.conf", config, { mode: 0o600 })
    connection = next
    child = spawn(
      "/usr/local/bin/wireproxy",
      ["-s", "-c", "/tmp/wireproxy/client.conf"],
      { env: { PATH: process.env.PATH }, stdio: "ignore" },
    )
    child.on("error", () => {
      health = { ready: false, error: "WireGuard process failed" }
    })
    child.on("exit", () => {
      health = { ready: false, error: "WireGuard process stopped" }
    })
    console.log(
      JSON.stringify({
        at: timestamp(),
        kind: "vpn_server_selected",
        provider: c.role,
        country: next.country,
        hostname: next.hostname,
      }),
    )
  }
  // Health checks traverse the tunnel, including DNS. The observer containers
  // have no public network, so a failed tunnel cannot become a direct request.
  let rotateAt = 0,
    failures = 0
  await start()
  rotateAt =
    Date.now() +
    c.nordRotateSeconds * 1000 +
    randomInt(1, Math.max(2, c.nordRotateSeconds * 100))
  const timer = setInterval(async () => {
    if (checking || stopping) return
    checking = true
    try {
      if (
        !child?.pid ||
        child.exitCode !== null ||
        child.signalCode !== null ||
        (c.role === "nordvpn" && (Date.now() >= rotateAt || failures >= 3))
      ) {
        await start()
        failures = 0
        rotateAt =
          Date.now() +
          c.nordRotateSeconds * 1000 +
          randomInt(1, Math.max(2, c.nordRotateSeconds * 100))
      }
      const r = await tunnelRequest(EGRESS_CHECK_URL, {
        timeoutMs: 20000,
        maxBytes: 16384,
      })
      if (r.status !== 200) throw new Error("VPN egress check failed")
      const egress = validateEgress(
        { egressKind: "proxy" },
        JSON.parse(r.bytes),
      )
      health = {
        ready: true,
        egress,
        country: connection?.country,
        hostname: connection?.hostname,
      }
      failures = 0
    } catch {
      failures++
      health = {
        ready: false,
        error: "VPN unavailable; no direct fallback",
        checkedAt: timestamp(),
      }
    } finally {
      checking = false
    }
  }, 30000)
  process.on("SIGTERM", () => {
    stopping = true
    clearInterval(timer)
    child?.kill("SIGTERM")
    server.close(() => process.exit(0))
  })
  return server
}
