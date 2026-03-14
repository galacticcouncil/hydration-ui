import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { uniqueBy } from "remeda"

import { nativeTokenLocksQuery } from "@/api/balances"
import { TUnlockableVote } from "@/api/democracy"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useUnlockNativeLocks = (
  ids: ReadonlyArray<TUnlockableVote>,
  value: string,
) => {
  const { t } = useTranslation("wallet")
  const rpcProvider = useRpcProvider()
  const { papi } = rpcProvider
  const { account } = useAccount()

  const createBatch = useCreateBatchTx()

  return useMutation({
    mutationFn: async () => {
      const txs = ids.map((id) =>
        papi.tx.ConvictionVoting.remove_vote({
          class: id.classId,
          index: id.voteId,
        }),
      )

      if (!txs.length) {
        return null
      }

      const target = account?.address
        ? safeConvertAddressSS58(account.address)
        : null

      const unlock = uniqueBy(ids, (id) => id.classId)

      const batchTx = [
        ...txs,
        ...(target
          ? unlock.map((id) =>
              papi.tx.ConvictionVoting.unlock({ target, class: id.classId }),
            )
          : []),
      ]

      const type = new Big(value).eq(0) ? "clear" : "unlock"
      const amount = ids.length

      const toasts = {
        submitted: t(`myAssets.expandedNative.${type}.onLoading`, {
          amount,
          value,
        }),
        success: t(`myAssets.expandedNative.${type}.onSuccess`, {
          amount,
          value,
        }),
      }

      return await createBatch({
        txs: batchTx,
        transaction: {
          toasts,
          invalidateQueries: [
            nativeTokenLocksQuery(rpcProvider, account?.address ?? ""),
          ],
        },
      })
    },
  })
}
