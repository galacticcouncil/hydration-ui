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
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

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

  const { createTransaction } = useTransactionsStore()

  const { data: pools = [] } = useXykPools()

  const { rewards: miningRewards = [], refetch: refetchMiningRewards } =
    useLiquidityMiningRewards()

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

      const tx = papi.tx.Utility.batch_all({
        calls: [
          ...(!walletRewards.incentives.isEmpty
            ? [claimBorrow.decodedCall]
            : []),
          ...(!walletRewards.farming.isEmpty
            ? farmRewardsTx.map((tx) => tx.decodedCall)
            : []),
          // TODO staking claim is disabled currently
          // ...(!walletRewards.staking.isEmpty && claimStaking
          //   ? claimStaking.decodedCall.type === "Staking"
          //     ? [claimStaking.decodedCall]
          //     : claimStaking.decodedCall.value.value.calls
          //   : []),
          ...(!walletRewards.referral.isEmpty
            ? [claimReferral.decodedCall]
            : []),
        ],
      })

      return await createTransaction(
        {
          tx,
          // TODO add toasts
          toasts: {
            submitted: "TODO",
            success: "TODO",
          },
        },
        {
          async onSuccess() {
            await Promise.all([
              ...(farmRewardsTx.length ? [refetchMiningRewards] : []),
              invalidateStakeData.mutateAsync(),
            ])
          },
        },
      )
    },
  })
}
