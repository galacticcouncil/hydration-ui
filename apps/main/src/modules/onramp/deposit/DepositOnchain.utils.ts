import { isAddressValidOnChain } from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { AnyChain } from "@galacticcouncil/xc-core"

import { isAccountValidOnChain } from "@/modules/xcm/transfer/utils/chain"

/** Watch-only providers support multiple formats; the address still has to match the source chain. */
export const canUseDepositAccount = (
  account: Account | null,
  chain: AnyChain,
): account is Account =>
  isAccountValidOnChain(account, chain) &&
  isAddressValidOnChain(account.rawAddress, chain)
