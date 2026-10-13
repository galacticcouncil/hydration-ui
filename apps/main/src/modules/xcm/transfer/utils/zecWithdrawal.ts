import { isAddressValidOnChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"

import { NEAR_CHAIN_KEY } from "@/modules/xcm/history/utils/journey"

/** Whether an account can take 1Click's refund of a withdrawal, on NEAR. */
export const isNearAccount = (account: string | undefined): boolean => {
  const near = chainsMap.get(NEAR_CHAIN_KEY)
  return !!near && !!account && isAddressValidOnChain(account, near)
}
