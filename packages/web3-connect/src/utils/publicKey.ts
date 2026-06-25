import {
  EvmAddr,
  NearAddr,
  safeConvertSS58toPublicKey,
  SolanaAddr,
  Ss58Addr,
  SuiAddr,
  ZcashAddr,
} from "@galacticcouncil/utils"

/**
 * Canonical dedup / savedBy key for an address across every supported chain.
 *
 * - H160 (EVM) -> the address itself
 * - SS58 (Substrate) -> the decoded public key
 * - Solana -> the address itself
 * - Sui -> the address lowercased
 * - anything else -> "" (falsy)
 *
 * Branching mirrors getWalletModeByAddress so the key is consistent with the
 * chainKey classification used elsewhere.
 */
export const addressToPublicKey = (address: string): string => {
  switch (true) {
    case EvmAddr.isValid(address):
      return address.toLowerCase()
    case Ss58Addr.isValid(address):
      return safeConvertSS58toPublicKey(address)
    case SolanaAddr.isValid(address):
      return address.toLowerCase()
    case SuiAddr.isValid(address):
      return address.toLowerCase()
    case NearAddr.isValid(address):
      return address.toLowerCase()
    case ZcashAddr.isValid(address):
      return address.toLowerCase()
    default:
      return ""
  }
}
