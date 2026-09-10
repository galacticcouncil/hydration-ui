import { addr } from "@galacticcouncil/xc-core"

import { neckwork } from "./neckwork"
import { solexplorer } from "./solana"
import { suivision } from "./sui"
import { isAddressValidOnHydration } from "./xcm"
import { xcscan } from "./xcscan"

const { Ss58Addr, EvmAddr, SolanaAddr, SuiAddr, NearAddr, ZecAddr } = addr

export function parseNearAccountName(address: string): string {
  const trimmed = address.trim()
  if (!NearAddr.isValid(trimmed)) return ""
  if (NearAddr.isImplicit(trimmed)) return ""
  if (!trimmed.endsWith(".near")) return ""
  return trimmed.slice(0, -".near".length)
}

export { EvmAddr, NearAddr, SolanaAddr, Ss58Addr, SuiAddr, ZecAddr }

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
