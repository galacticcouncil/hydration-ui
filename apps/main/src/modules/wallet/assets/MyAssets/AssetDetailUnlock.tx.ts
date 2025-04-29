import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { useAccount } from "@galacticcouncil/web3-connect"
import { safeConvertAddressSS58 } from "@galacticcouncil/web3-connect/src/utils/safeConvertAddressSS58"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { nativeTokenLocksQuery } from "@/api/balances"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useUnlockNativeLocks = (
  ids: ReadonlyArray<number>,
  value: string,
) => {
  const { t } = useTranslation("wallet")
  const rpcProvider = useRpcProvider()
  const { papi } = rpcProvider
  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const txs = ids.map((id) => papi.tx.Democracy.remove_vote({ index: id }))

      if (!txs.length) {
        return null
      }

      const target = account?.address
        ? safeConvertAddressSS58(account.address, HYDRADX_SS58_PREFIX)
        : null

      const batchTx = [
        ...txs,
        ...(target ? [papi.tx.Democracy.unlock({ target })] : []),
      ]

      const type = new Big(value).eq(0) ? "clear" : "unlock"
      const amount = ids.length

      return createTransaction({
        tx: papi.tx.Utility.batch_all({
          calls: batchTx.map((tx) => tx.decodedCall),
        }),
        toasts: {
          submitted: t(`myAssets.expandedNative.${type}.onLoading`, {
            amount,
            value,
          }),
          success: t(`myAssets.expandedNative.${type}.onSuccess`, {
            amount,
            value,
          }),
          error: t(`myAssets.expandedNative.${type}.onError`, {
            amount,
            value,
          }),
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(
        nativeTokenLocksQuery(rpcProvider, account?.address ?? ""),
      )
    },
  })
}
