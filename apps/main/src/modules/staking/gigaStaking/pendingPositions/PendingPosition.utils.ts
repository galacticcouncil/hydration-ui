import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { nativeTokenLocksQuery } from "@/api/balances"
import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import {
  gigaTotalLockedQuery,
  gigaUnstakePositionsQuery,
} from "@/api/gigaStake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useCancelPendingPosition = () => {
  const { account } = useAccount()
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { t } = useTranslation("staking")
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const mutation = useMutation({
    mutationFn: async ({
      voteAtBlock,
      amount,
    }: {
      voteAtBlock: number
      amount: bigint
    }) => {
      const accountAddress = account?.address ?? ""
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const tx = unsafeApi.tx.GigaHdx.cancel_unstake({
        position_id: voteAtBlock,
      })

      const toasts = {
        submitted: t("gigaStaking.cancelPendingPosition.toasts.submitted", {
          value: scaleHuman(amount, native.decimals),
          symbol: native.symbol,
        }),
        success: t("gigaStaking.cancelPendingPosition.toasts.success", {
          value: scaleHuman(amount, native.decimals),
          symbol: native.symbol,
        }),
      }

      return createTransaction({
        tx,
        invalidateQueries: [
          userGigaBorrowSummaryQueryKey(accountAddress),
          gigaUnstakePositionsQuery(rpc, accountAddress).queryKey,
          gigaTotalLockedQuery(rpc).queryKey,
        ],
        toasts,
      })
    },
  })

  return mutation
}

export const useClaimPendingPosition = () => {
  const { account } = useAccount()
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { t } = useTranslation("staking")
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const mutation = useMutation({
    mutationFn: async ({
      voteAtBlock,
      amount,
    }: {
      voteAtBlock: number
      amount: bigint
    }) => {
      const accountAddress = account?.address ?? ""
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const tx = unsafeApi.tx.GigaHdx.unlock({
        position_id: voteAtBlock,
      })

      const toasts = {
        submitted: t("gigaStaking.claimPendingPosition.toasts.submitted", {
          value: scaleHuman(amount, native.decimals),
          symbol: native.symbol,
        }),
        success: t("gigaStaking.claimPendingPosition.toasts.success", {
          value: scaleHuman(amount, native.decimals),
          symbol: native.symbol,
        }),
      }

      return createTransaction({
        tx,
        invalidateQueries: [
          gigaUnstakePositionsQuery(rpc, accountAddress).queryKey,
          nativeTokenLocksQuery(rpc, accountAddress).queryKey,
        ],
        toasts,
      })
    },
  })

  return mutation
}
