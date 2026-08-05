import { addr } from "@galacticcouncil/xc-core"

const { Ss58Addr, EvmAddr, SolanaAddr, SuiAddr } = addr

const NEAR_ACCOUNT =
  /^(?=.{2,64}$)[a-z0-9]+(?:[-_][a-z0-9]+)*(?:\.[a-z0-9]+(?:[-_][a-z0-9]+)*)*\.near$/

const NearAddr = {
  // Structural validation of a NEAR named `.near` account (NEP-0009 charset +
  // length). No implicit (64-hex) accounts, no on-chain existence check.
  isValid: (addr: string): boolean => NEAR_ACCOUNT.test(addr.trim()),
  parseAccountName: (addr: string): string => {
    const trimmed = addr.trim()
    if (!NearAddr.isValid(trimmed)) return ""
    return trimmed.slice(0, -".near".length)
  },
}

// Structural validation only (prefix + charset + length); no Base58Check /
// Bech32m checksum verification.
// ponytail: regex catches typos; upgrade to @scure/base decode if a malformed-
// but-well-formed address ever needs rejecting on this funds path.
const ZCASH_TRANSPARENT = /^t[13][1-9A-HJ-NP-Za-km-z]{33}$/
const ZCASH_UNIFIED = /^u1[02-9ac-hj-np-z]{40,}$/

const ZcashAddr = {
  isValid: (addr: string): boolean => {
    const trimmed = addr.trim()
    return ZCASH_TRANSPARENT.test(trimmed) || ZCASH_UNIFIED.test(trimmed)
  },
}

export { EvmAddr, NearAddr, SolanaAddr, Ss58Addr, SuiAddr, ZcashAddr }
