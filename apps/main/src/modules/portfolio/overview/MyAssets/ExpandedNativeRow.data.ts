import Big from "big.js"

import { TokenLockType, useNativeTokenLocks } from "@/api/balances"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const useNativeAssetLocks = () => {
  const { native } = useAssets()

  const { data: locks, isLoading } = useNativeTokenLocks()
  const { price } = useAssetPrice(native.id)

  const lockedInGigaStaking = scaleHuman(
    locks?.get(TokenLockType.GigaStaking) ?? "0",
    native.decimals,
  )
  const lockedInVesting = scaleHuman(
    locks?.get(TokenLockType.Vesting) ?? "0",
    native.decimals,
  )
  const lockedInDemocracy = scaleHuman(
    locks?.get(TokenLockType.Democracy) ?? "0",
    native.decimals,
  )
  const lockedInOpenGov = scaleHuman(
    locks?.get(TokenLockType.OpenGov) ?? "0",
    native.decimals,
  )
  const lockedInStaking = scaleHuman(
    locks?.get(TokenLockType.Staking) ?? "0",
    native.decimals,
  )

  const lockedInGigaStakingDisplay = Big(lockedInGigaStaking)
    .times(price)
    .toString()
  const lockedInVestingDisplay = Big(lockedInVesting).times(price).toString()
  const lockedInDemocracyDisplay = Big(lockedInDemocracy)
    .times(price)
    .toString()
  const lockedInOpenGovDisplay = Big(lockedInOpenGov).times(price).toString()
  const lockedInStakingDisplay = Big(lockedInStaking).times(price).toString()

  return {
    lockedInGigaStaking,
    lockedInGigaStakingDisplay,
    lockedInVesting,
    lockedInVestingDisplay,
    lockedInDemocracy,
    lockedInDemocracyDisplay,
    lockedInOpenGov,
    lockedInOpenGovDisplay,
    lockedInStaking,
    lockedInStakingDisplay,
    isLoading,
  }
}
