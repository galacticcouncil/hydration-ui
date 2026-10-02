import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { timestamp } from "./util.mjs"

export const EGRESS_CHECK_URL = "https://check.torproject.org/api/ip"

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
