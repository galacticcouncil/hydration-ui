import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

import { useGetClaimAllBorrowRewardsTx } from "@/api/borrow"
import { uniquesIds } from "@/api/constants"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { useXykPools } from "@/api/pools"
import { stakingPositionsQuery, useInvalidateStakeData } from "@/api/staking"
import {
  getClaimFarmRewardsTx,
  useLiquidityMiningRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { getClaimStakingTx } from "@/modules/staking/ClaimStaking.tx"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"
import { useRpcProvider } from "@/providers/rpcProvider"

// @ts-expect-error Temporarily unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useGetClaimStakingTx = () => {
  const rpc = useRpcProvider()
  const { papi } = rpc

  const { account } = useAccount()
  const address = account?.address

  const { data: uniquesData } = useQuery(uniquesIds(rpc))
  const stakingId = uniquesData?.stakingId ?? 0n
  const { data: stakingPositionsData } = useQuery(
    stakingPositionsQuery(rpc, address ?? "", stakingId),
  )
  const positionId = stakingPositionsData?.stakePositionId

  const { data: votes = [], isSuccess: votesSuccess } = useQuery(
    accountOpenGovVotesQuery(rpc, address ?? ""),
  )

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
  const rpc = useRpcProvider()
  const { papi } = rpc

  const { data: pools = [] } = useXykPools()

  const { rewards: miningRewards = [], refetch: refetchMiningRewards } =
    useLiquidityMiningRewards()

  const createBatch = useCreateBatchTx()

  const getClaimBorrowTx = useGetClaimAllBorrowRewardsTx()
  const farmRewardsTx = getClaimFarmRewardsTx(papi, pools, miningRewards)
  const walletRewards = useWalletRewardsSectionData()
  const invalidateStakeData = useInvalidateStakeData()
  // const getClaimStakingTx = useGetClaimStakingTx()

  return useMutation({
    mutationFn: async () => {
      const claimBorrow = await getClaimBorrowTx()
      // const claimStaking = getClaimStakingTx()
      const claimReferral = papi.tx.Referrals.claim_rewards()

      const txs = [
        ...(!walletRewards.incentives.isEmpty ? [claimBorrow] : []),
        ...(!walletRewards.farming.isEmpty ? farmRewardsTx : []),
        ...(!walletRewards.referral.isEmpty ? [claimReferral] : []),
      ]

      const toasts = {
        submitted: "TODO",
        success: "TODO",
      }

      const result = await createBatch({
        txs,
        transaction: {
          toasts,
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
