import { useClaimableRewards } from "@galacticcouncil/money-market/hooks"
import Big from "big.js"

import { useReferralRewards } from "@/hooks/data/useReferralRewards"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { useLiquidityMiningRewards } from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"

export const useWalletRewardsSectionData = () => {
  const { claimableRewardsUsd, loading: incentivesLoading } =
    useClaimableRewards()
  const { totalAmount, loading: liquidityLoading } =
    useLiquidityMiningRewards(true)

  const { data: staking, isLoading: stakingLoading } = useStakingRewards()
  const { data: referral, isLoading: referralLoading } = useReferralRewards()

  const incentivesEmpty = claimableRewardsUsd <= 0
  const farmingEmpty = totalAmount <= 0
  const stakingEmpty = Big(staking || "0").lte(0)
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
      value: totalAmount,
      loading: liquidityLoading,
      isEmpty: farmingEmpty,
    },
    staking: {
      value: staking || "0",
      loading: stakingLoading,
      isEmpty: stakingEmpty,
    },
    referral: {
      value: referral?.totalRewards || "0",
      symbol: referral?.symbol || "HDX",
      loading: referralLoading,
      isEmpty: referralsEmpty,
    },
    isEmpty,
    isLoading,
  }
}
