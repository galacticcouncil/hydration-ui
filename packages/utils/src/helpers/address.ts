import { addr } from "@galacticcouncil/xc-core"
import { sha256 } from "@noble/hashes/sha256"
import { createBase58check } from "@scure/base"

const { Ss58Addr, EvmAddr, SolanaAddr, SuiAddr } = addr

const NearAddr = {
  isValid: (addr: string): boolean => /^.+\.near$/.test(addr.trim()),
  parseAccountName: (addr: string): string => {
    const trimmed = addr.trim()
    if (!NearAddr.isValid(trimmed)) return ""
    return trimmed.slice(0, -".near".length)
  },
}

// Mainnet transparent Zcash version prefixes: t1 = 0x1CB8, t3 = 0x1CBD
const ZCASH_T_PREFIXES = [
  [0x1c, 0xb8],
  [0x1c, 0xbd],
]
const base58check = createBase58check(sha256)

const ZcashAddr = {
  isValid: (addr: string): boolean => {
    try {
      const bytes = base58check.decode(addr.trim())
      return ZCASH_T_PREFIXES.some(([a, b]) => bytes[0] === a && bytes[1] === b)
    } catch {
      return false
    }
  },
}

export { EvmAddr, NearAddr, SolanaAddr, Ss58Addr, SuiAddr, ZcashAddr }
