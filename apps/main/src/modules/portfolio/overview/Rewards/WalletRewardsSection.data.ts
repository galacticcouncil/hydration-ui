import { useClaimableRewards } from "@galacticcouncil/money-market/react"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"

import { useReferralRewards } from "@/hooks/data/useReferralRewards"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { useLiquidityMiningRewards } from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { MIN_CLAIMABLE_INCENTIVES_USDT } from "@/modules/money-market/constants"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useAssets } from "@/providers/assetsProvider"

export const useWalletRewardsSectionData = () => {
  const { native } = useAssets()

  const user = useUserAddress()
  const { data: incentives, isPending } = useClaimableRewards(user)
  const incentivesLoading = !!user && isPending

  const claimableRewardsUsd = (incentives ?? [])
    .reduce((sum, reward) => sum.plus(reward.amountUsd), Big(0))
    .toNumber()

  const {
    claimableValues: { totalUSD: liquidityUSD, isLoading: liquidityLoading },
  } = useLiquidityMiningRewards()

  const { data: staking, isLoading: stakingLoading } = useStakingRewards()
  const { data: referral, isLoading: referralLoading } = useReferralRewards()

  const incentivesEmpty = claimableRewardsUsd < MIN_CLAIMABLE_INCENTIVES_USDT
  const farmingEmpty = Big(liquidityUSD).lte(0)
  const stakingEmpty = Big(staking?.maxRewards || "0").lte(0)
  const referralsEmpty = Big(referral?.totalRewards || "0").lte(0)

  // TODO when staking claim is approved it should affect possibility of claiming all rewards
  // const isEmpty =
  //   incentivesEmpty && farmingEmpty && stakingEmpty && referralsEmpty

  const isEmpty = incentivesEmpty && farmingEmpty && referralsEmpty

  const isLoading =
    incentivesLoading || liquidityLoading || stakingLoading || referralLoading

  return {
    incentives: {
      value: claimableRewardsUsd,
      assetId: USDT_ASSET_ID,
      loading: incentivesLoading,
      isEmpty: incentivesEmpty,
    },
    farming: {
      value: liquidityUSD,
      assetId: USDT_ASSET_ID,
      loading: liquidityLoading,
      isEmpty: farmingEmpty,
    },
    staking: {
      value: staking?.maxRewards || "0",
      symbol: native.symbol,
      loading: stakingLoading,
      isEmpty: stakingEmpty,
    },
    referral: {
      value: referral?.totalRewards || "0",
      assetId: native.id,
      loading: referralLoading,
      isEmpty: referralsEmpty,
    },
    isEmpty,
    isLoading,
  }
}
