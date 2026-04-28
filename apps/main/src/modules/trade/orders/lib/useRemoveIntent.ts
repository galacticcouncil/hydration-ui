/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useRemoveIntent = () => {
  const { t } = useTranslation("trade")
  const { papiClient } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return useMutation({
    mutationFn: (intentId: bigint) => {
      const unsafeApi = papiClient.getUnsafeApi() as any
      const tx = unsafeApi.tx.Intent.remove_intent({ id: intentId })

      return createTransaction(
        {
          tx,
          toasts: {
            success: t("trade.cancelIntent.success"),
            submitted: t("trade.cancelIntent.loading"),
            error: t("trade.cancelIntent.error"),
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["intents", "byAccount", account?.address ?? ""],
            })
          },
        },
      )
    },
  })
}
