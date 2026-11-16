import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { useGetClaimAllBorrowRewardsTx } from "@/api/borrow"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { useXykPools } from "@/api/pools"
import {
  rewardsDistributorAccountKey,
  useGetRewardsDistributorClaimTx,
} from "@/api/rewardsDistributor"
import { stakingPositionsQuery, useInvalidateStakeData } from "@/api/staking"
import {
  getClaimFarmRewardsTx,
  useLiquidityMiningRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { useWalletRewardsSectionData } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.data"
import { getClaimStakingTx } from "@/modules/staking/ClaimStaking.tx"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"

// @ts-expect-error Temporarily unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useGetClaimStakingTx = () => {
  const rpc = useRpcProvider()
  const { papi } = rpc

  const { account } = useAccount()
  const address = account?.address

  const { data: stakingPositionsData } = useQuery(
    stakingPositionsQuery(rpc, address ?? ""),
  )
  const positionId = stakingPositionsData?.stakePositionId

  const { data: accountVotes, isSuccess: votesSuccess } = useQuery(
    accountOpenGovVotesQuery(rpc, address ?? ""),
  )
  const votes = accountVotes?.votes ?? []

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  return useCallback(() => {
    return positionId === undefined
      ? undefined
      : getClaimStakingTx(
          papi,
          positionId,
          newProcessedVotesIds,
          oldProcessedVotesIds,
        )
  }, [papi, positionId, newProcessedVotesIds, oldProcessedVotesIds])
}

export const useClaimAllWalletRewards = () => {
  const { t } = useTranslation("wallet")
  const rpc = useRpcProvider()
  const { papi } = rpc

  const { data: pools = [] } = useXykPools()

  const { rewards: miningRewards = [], refetch: refetchMiningRewards } =
    useLiquidityMiningRewards()

  const createBatch = useCreateBatchTx()

  const getClaimBorrowTx = useGetClaimAllBorrowRewardsTx()
  const getClaimDistributorTx = useGetRewardsDistributorClaimTx()
  const walletRewards = useWalletRewardsSectionData()
  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async () => {
      const farmRewardsTx = getClaimFarmRewardsTx(papi, pools, miningRewards)
      // built only when needed: it throws when the controller has nothing for the account
      const claimBorrow = walletRewards.incentives.isControllerEmpty
        ? undefined
        : await getClaimBorrowTx()
      const claimDistributor = await getClaimDistributorTx()

      const claimReferral = papi.tx.Referrals.claim_rewards()

      const txs = [
        ...(claimBorrow ? [claimBorrow] : []),
        ...(claimDistributor ? [claimDistributor] : []),
        ...(!walletRewards.farming.isEmpty ? farmRewardsTx : []),
        ...(!walletRewards.referral.isEmpty ? [claimReferral] : []),
      ]

      const toasts = {
        submitted: t("rewards.claim.toasts.submitted"),
        success: t("rewards.claim.toasts.success"),
      }

      const result = await createBatch({
        txs,
        transaction: {
          toasts,
          invalidateQueries: claimDistributor
            ? [rewardsDistributorAccountKey(rpc)]
            : undefined,
        },
      })

      await Promise.all([
        ...(farmRewardsTx.length ? [refetchMiningRewards] : []),
        invalidateStakeData.mutateAsync(),
      ])

      return result
    },
  })
}
