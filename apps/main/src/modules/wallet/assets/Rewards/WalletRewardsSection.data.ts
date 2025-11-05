import Big from "big.js"

import { useBorrowClaimableRewards } from "@/api/borrow"
import { useReferralRewards } from "@/hooks/data/useReferralRewards"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { useLiquidityMiningRewards } from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { useAssets } from "@/providers/assetsProvider"

export const useWalletRewardsSectionData = () => {
  const { native } = useAssets()

  const { data: incentives, isLoading: incentivesLoading } =
    useBorrowClaimableRewards()

  const claimableRewardsUsd = incentives?.claimableRewardsUsd || 0

  const {
    claimableValues: { totalUSD: liquidityUSD, isLoading: liquidityLoading },
  } = useLiquidityMiningRewards()

  const { data: staking, isLoading: stakingLoading } = useStakingRewards()
  const { data: referral, isLoading: referralLoading } = useReferralRewards()

  const incentivesEmpty = claimableRewardsUsd <= 0
  const farmingEmpty = Big(liquidityUSD).lte(0)
  const stakingEmpty = Big(staking?.maxRewards || "0").lte(0)
  const referralsEmpty = Big(referral?.totalRewards || "0").lte(0)

  const isEmpty =
    incentivesEmpty && farmingEmpty && stakingEmpty && referralsEmpty

  const isLoading =
    incentivesLoading || liquidityLoading || stakingLoading || referralLoading

  return {
    incentives: {
      value: claimableRewardsUsd,
      loading: incentivesLoading,
      isEmpty: incentivesEmpty,
    },
    farming: {
      value: liquidityUSD,
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
      symbol: referral?.symbol ?? native.symbol,
      loading: referralLoading,
      isEmpty: referralsEmpty,
    },
    isEmpty,
    isLoading,
  }
}
