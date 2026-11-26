import { buildClaimAllRewards } from "@galacticcouncil/money-market/core"
import { useUserIncentives } from "@galacticcouncil/money-market/react"
import { type ActionPlan } from "@galacticcouncil/money-market/types"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { accountOpenGovVotesQuery } from "@/api/democracy"
import { useXykPools } from "@/api/pools"
import {
  rewardsDistributorAccountKey,
  useGetRewardsDistributorClaimCall,
} from "@/api/rewardsDistributor"
import { stakingPositionsQuery, useInvalidateStakeData } from "@/api/staking"
import {
  getClaimFarmRewardsTx,
  useLiquidityMiningRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import {
  fetchFeePerGas,
  planToTransaction,
} from "@/modules/money-market/actions/planToTransaction"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useWalletRewardsSectionData } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.data"
import { getClaimStakingTx } from "@/modules/staking/ClaimStaking.tx"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"

/** Turns a plan into an extrinsic that can be batched with the other claims. */
const useGetPlanTx = () => {
  const { papi, evm } = useRpcProvider()

  return useCallback(
    async (plan: ActionPlan, from: string) => {
      const feePerGas = await fetchFeePerGas(evm)
      const tx = planToTransaction(plan, { papi, from, feePerGas })

      if (isEvmCall(tx)) {
        return papi.tx.Dispatcher.dispatch_evm_call({
          call: transformEvmCallToPapiTx(papi, tx).decodedCall,
        })
      }
      if (isPapiTransaction(tx)) return tx

      throw new Error("Invalid claim transaction")
    },
    [papi, evm],
  )
}

const useGetClaimBorrowTx = () => {
  const user = useUserAddress()
  const { data: userIncentives } = useUserIncentives(user)
  const getPlanTx = useGetPlanTx()

  return useCallback(async () => {
    if (!user || !userIncentives) throw new Error("User incentives not found")

    return getPlanTx(buildClaimAllRewards({ userIncentives, to: user }), user)
  }, [getPlanTx, user, userIncentives])
}

/** The rewards distributor's claim, or nothing when it has none to make. */
const useGetClaimDistributorTx = () => {
  const user = useUserAddress()
  const getClaimCall = useGetRewardsDistributorClaimCall()
  const getPlanTx = useGetPlanTx()

  return useCallback(async () => {
    const call = await getClaimCall()
    if (!user || !call) return undefined

    return getPlanTx([call], user)
  }, [getClaimCall, getPlanTx, user])
}

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

  const { newProcessedVotesIds } = useProcessedVotes(votes, votesSuccess)

  return useCallback(() => {
    return positionId === undefined
      ? undefined
      : getClaimStakingTx(papi, positionId, newProcessedVotesIds)
  }, [papi, positionId, newProcessedVotesIds])
}

export const useClaimAllWalletRewards = () => {
  const { t } = useTranslation("wallet")
  const rpc = useRpcProvider()
  const { papi } = rpc

  const { data: pools = [] } = useXykPools()

  const { rewards: miningRewards = [], refetch: refetchMiningRewards } =
    useLiquidityMiningRewards()

  const createBatch = useCreateBatchTx()

  const getClaimBorrowTx = useGetClaimBorrowTx()
  const getClaimDistributorTx = useGetClaimDistributorTx()
  const walletRewards = useWalletRewardsSectionData()
  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async () => {
      const farmRewardsTx = getClaimFarmRewardsTx(papi, pools, miningRewards)
      const claimReferral = papi.tx.Referrals.claim_rewards()
      const claimDistributor = await getClaimDistributorTx()

      const txs = [
        // `isEmpty` covers the distributor too; the controller has its own
        ...(!walletRewards.incentives.isControllerEmpty
          ? [await getClaimBorrowTx()]
          : []),
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
