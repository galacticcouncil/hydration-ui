import { addr } from "@galacticcouncil/xc-core"

const { Ss58Addr, EvmAddr, SolanaAddr, SuiAddr } = addr

const NearAddr = {
  isValid: (addr: string): boolean => /^.+\.near$/.test(addr.trim()),
  parseAccountName: (addr: string): string => {
    const trimmed = addr.trim()
    if (!NearAddr.isValid(trimmed)) return ""
    return trimmed.slice(0, -".near".length)
  },
}

const ZCASH_PREFIXES = ["t1", "t3", "u1"] as const

const ZcashAddr = {
  isValid: (addr: string): boolean => {
    const trimmed = addr.trim()
    return ZCASH_PREFIXES.some((prefix) => trimmed.startsWith(prefix))
  },
}

export { EvmAddr, NearAddr, SolanaAddr, Ss58Addr, SuiAddr, ZcashAddr }
