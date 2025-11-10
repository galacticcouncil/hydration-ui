import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"

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

export const useClaimAllWalletRewards = () => {
  const { account } = useAccount()
  const address = account?.address

  const rpc = useRpcProvider()
  const { papi } = rpc

  const { createTransaction } = useTransactionsStore()

  const { data: pools = [] } = useXykPools()

  const { rewards: miningRewards = [], refetch: refetchMiningRewards } =
    useLiquidityMiningRewards()

  const farmRewardsTx = getClaimFarmRewardsTx(papi, pools, miningRewards)

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

  const walletRewards = useWalletRewardsSectionData()

  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async () => {
      const claimStaking =
        positionId === undefined
          ? undefined
          : getClaimStakingTx(
              papi,
              positionId,
              newProcessedVotesIds,
              oldProcessedVotesIds,
            )

      const claimReferral = papi.tx.Referrals.claim_rewards()

      const tx = papi.tx.Utility.batch_all({
        calls: [
          ...(!walletRewards.farming.isEmpty
            ? farmRewardsTx.map((tx) => tx.decodedCall)
            : []),
          ...(!walletRewards.staking.isEmpty && claimStaking
            ? claimStaking.decodedCall.type === "Staking"
              ? [claimStaking.decodedCall]
              : claimStaking.decodedCall.value.value.calls
            : []),
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
