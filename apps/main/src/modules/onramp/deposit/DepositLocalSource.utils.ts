import {
  HYDRATION_CHAIN_KEY,
  isAddressValidOnHydration,
  normalizeSS58Address,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"

import type { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"

// Same-chain transfers use the native transfer form, outside the SDK bridge routes.
export const withHydrationDepositSource = (
  pairs: ChainAssetPair[],
): ChainAssetPair[] => {
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const hdx = hydration?.assetsData.get("hdx")?.asset
  if (
    !hydration ||
    !hdx ||
    pairs.some(({ chain }) => chain.key === HYDRATION_CHAIN_KEY)
  )
    return pairs
  return [
    { chain: hydration, assets: [hdx], routes: [], isTagSelect: false },
    ...pairs,
  ]
}

export const isHydrationDepositSource = (
  account: Account,
  receiver: Account | null,
): boolean => {
  if (
    !account.canUseOnHydration ||
    !isAddressValidOnHydration(account.rawAddress)
  )
    return false
  if (!receiver) return true
  const key = (value: Account) =>
    value.publicKey ||
    safeConvertSS58toPublicKey(normalizeSS58Address(value.rawAddress))
  return key(account).toLowerCase() !== key(receiver).toLowerCase()
}
