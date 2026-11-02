import {
  EvmAddr,
  NearAddr,
  safeConvertSS58toPublicKey,
  SolanaAddr,
  Ss58Addr,
  SuiAddr,
  ZecAddr,
} from "@galacticcouncil/utils"

/**
 * Canonical dedup / savedBy key for an address across every supported chain,
 * or "" when unresolvable. Branching mirrors `getWalletModeByAddress`.
 *
 * Keys keep their case (base58 chains are case-sensitive), so compare them
 * with `stringEquals`, never `===`, or EVM checksum variants won't match.
 */
export const addressToPublicKey = (address: string): string => {
  switch (true) {
    case EvmAddr.isValid(address):
      return address
    case Ss58Addr.isValid(address):
      return safeConvertSS58toPublicKey(address)
    case SolanaAddr.isValid(address):
      return address
    case SuiAddr.isValid(address):
      return address
    case NearAddr.isValid(address):
      return address
    case ZecAddr.isValid(address):
      return address
    default:
      return ""
  }
}
