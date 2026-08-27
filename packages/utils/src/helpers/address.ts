import { addr } from "@galacticcouncil/xc-core"

import { neckwork } from "./neckwork"
import { solexplorer } from "./solana"
import { suivision } from "./sui"
import { isAddressValidOnHydration } from "./xcm"
import { xcscan } from "./xcscan"

const { Ss58Addr, EvmAddr, SolanaAddr, SuiAddr } = addr

const NEAR_ACCOUNT =
  /^(?=.{2,64}$)[a-z0-9]+(?:[-_][a-z0-9]+)*(?:\.[a-z0-9]+(?:[-_][a-z0-9]+)*)*\.near$/

const NearAddr = {
  isValid: (addr: string): boolean => NEAR_ACCOUNT.test(addr.trim()),
  parseAccountName: (addr: string): string => {
    const trimmed = addr.trim()
    if (!NearAddr.isValid(trimmed)) return ""
    return trimmed.slice(0, -".near".length)
  },
}

const ZCASH_TRANSPARENT = /^t[13][1-9A-HJ-NP-Za-km-z]{33}$/
const ZCASH_UNIFIED = /^u1[02-9ac-hj-np-z]{40,}$/

const ZcashAddr = {
  isValid: (addr: string): boolean => {
    const trimmed = addr.trim()
    return ZCASH_TRANSPARENT.test(trimmed) || ZCASH_UNIFIED.test(trimmed)
  },
}

export { EvmAddr, NearAddr, SolanaAddr, Ss58Addr, SuiAddr, ZcashAddr }

export function getAccountExplorerLink(address: string) {
  if (isAddressValidOnHydration(address)) {
    return neckwork.account(address)
  }

  if (SolanaAddr.isValid(address)) {
    return solexplorer.account(address)
  }

  if (SuiAddr.isValid(address)) {
    return suivision.account(address)
  }

  return xcscan.search(address)
}
