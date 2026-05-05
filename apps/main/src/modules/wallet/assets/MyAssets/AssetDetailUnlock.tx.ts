import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { nativeTokenLocksQuery } from "@/api/balances"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useUnlockNativeLocks = (
  votesToRemove: ReadonlyArray<{ voteId: number; classId: number }>,
  classIds: ReadonlyArray<number>,
  value: string,
) => {
  const { t } = useTranslation("wallet")
  const rpcProvider = useRpcProvider()
  const { papi } = rpcProvider
  const { account } = useAccount()
  const { native } = useAssets()
  const createBatch = useCreateBatchTx()

  return useMutation({
    mutationFn: async () => {
      const txs = votesToRemove.map((vote) =>
        papi.tx.ConvictionVoting.remove_vote({
          class: vote.classId,
          index: vote.voteId,
        }),
      )

      if (!txs.length && !classIds.length) {
        return null
      }

      const target = account?.address
        ? safeConvertAddressSS58(account.address)
        : null

      const batchTx = [
        ...txs,
        ...(target
          ? classIds.map((id) =>
              papi.tx.ConvictionVoting.unlock({ target, class: id }),
            )
          : []),
      ]

      const type = new Big(value).eq(0) ? "clear" : "unlock"
      const amount = votesToRemove.length

      const toasts = {
        submitted: t(`myAssets.expandedNative.${type}.onLoading`, {
          amount,
          value,
          symbol: native.symbol,
        }),
        success: t(`myAssets.expandedNative.${type}.onSuccess`, {
          amount,
          value,
          symbol: native.symbol,
        }),
      }

      return await createBatch({
        txs: batchTx,
        transaction: {
          toasts,
          invalidateQueries: [
            nativeTokenLocksQuery(rpcProvider, account?.address ?? "").queryKey,
          ],
        },
      })
    },
  })
}
