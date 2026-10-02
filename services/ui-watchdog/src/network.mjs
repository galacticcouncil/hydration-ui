import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { timestamp } from "./util.mjs"

export const EGRESS_CHECK_URL = "https://check.torproject.org/api/ip"
export const EGRESS_CHECK_URLS = [
  EGRESS_CHECK_URL,
  "https://api.ipify.org?format=json",
]

export async function checkEgress(c, transport) {
  let lastError
  for (const url of EGRESS_CHECK_URLS) {
    try {
      const r = await transport(url, {
        timeoutMs: Math.min(c.timeoutMs || 20000, 20000),
        maxBytes: 16384,
      })
      if (r.status !== 200) throw new Error("Egress oracle unavailable")
      const value = JSON.parse(r.bytes)
      if (url === EGRESS_CHECK_URL) return validateEgress(c, value)
      if (
        !publicAddress(value.ip) ||
        (c.expectedExitIp && value.ip !== c.expectedExitIp)
      )
        throw new Error("Invalid fallback egress address")
      // ipify confirms reachability/IP, not Tor membership. Never invent IsTor.
      return {
        ip: value.ip,
        tor: null,
        kind: c.egressKind,
        checkedAt: timestamp(),
        membershipUnverified: true,
      }
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

export function publicAddress(ip) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number)
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19))
    )
  }
  if (isIP(ip) === 6)
    return /^[23]/.test(ip) && !ip.toLowerCase().startsWith("2001:db8:")
  return false
}

export function publicHost(host) {
  host = host
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
  if (isIP(host)) return publicAddress(host)
  return (
    host.includes(".") &&
    /^[a-z0-9.-]+$/.test(host) &&
    !/(?:^|\.)(?:localhost|local|internal|home|test|invalid)$/.test(host)
  )
}

export function publicNetworkPolicy({ remoteDns = false } = {}) {
  const cache = new Map()
  return async (raw) => {
    try {
      const u = new URL(raw)
      if (
        !["https:", "wss:"].includes(u.protocol) ||
        u.username ||
        u.password ||
        (u.port && u.port !== "443") ||
        !publicHost(u.hostname)
      )
        return false
      const host = u.hostname.replace(/^\[|\]$/g, "")
      if (isIP(host)) return publicAddress(host)
      // Proxied DNS must stay inside the proxy. The supplied stack also removes
      // the observer's direct egress; Tor rejects private destination addresses.
      if (remoteDns) return true
      if (!cache.has(host))
        cache.set(
          host,
          lookup(host, { all: true })
            .then(
              (a) => a.length > 0 && a.every((x) => publicAddress(x.address)),
            )
            .catch(() => false),
        )
      return await cache.get(host)
    } catch {
      return false
    }
  }
}

export function validateEgress(c, value) {
  if (
    !value ||
    !isIP(value.IP) ||
    !publicAddress(value.IP) ||
    typeof value.IsTor !== "boolean"
  )
    throw new Error("Invalid egress check response")
  if ((c.egressKind === "tor") !== value.IsTor)
    throw new Error(
      "Observed egress does not match the configured network path",
    )
  if (c.expectedExitIp && c.expectedExitIp !== value.IP)
    throw new Error("Observed egress does not match EXPECTED_EXIT_IP")
  return {
    ip: value.IP,
    tor: value.IsTor,
    kind: c.egressKind || "direct",
    checkedAt: timestamp(),
  }
}
