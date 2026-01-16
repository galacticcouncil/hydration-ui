import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { nativeTokenLocksQuery } from "@/api/balances"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useUnlockNativeLocks = (
  ids: ReadonlyArray<number>,
  value: string,
) => {
  const { t } = useTranslation("wallet")
  const rpcProvider = useRpcProvider()
  const { papi } = rpcProvider
  const { account } = useAccount()

  const createBatch = useCreateBatchTx()

  return useMutation({
    mutationFn: async () => {
      const txs = ids.map((id) => papi.tx.Democracy.remove_vote({ index: id }))

      if (!txs.length) {
        return null
      }

      const target = account?.address
        ? safeConvertAddressSS58(account.address)
        : null

      const batchTx = [
        ...txs,
        ...(target ? [papi.tx.Democracy.unlock({ target })] : []),
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
