import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { AnyTransaction } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useRemoveIntents = () => {
  const { t } = useTranslation(["common", "trade"])
  const { papiNext } = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const queryClient = useQueryClient()

  const queryKey = ["intents", "byAccount", account?.address ?? ""]

  return useMutation({
    onMutate: (intentIds) => {
      queryClient.setQueryData(
        queryKey,
        (prev: Array<{ id: bigint }> | undefined) =>
          prev?.filter((entry) => !intentIds.includes(entry.id)) ?? [],
      )
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    mutationFn: async (intentIds: bigint[]) => {
      const txs = intentIds.map((id) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (papiNext as any).tx.Intent.remove_intent({ id }),
      )

      const tx =
        txs.length === 1
          ? txs[0]
          : papiNext.tx.Utility.batch_all({
              calls: txs.map((t) => t.decodedCall),
            })

      return createTransaction(
        {
          tx: tx as AnyTransaction,
          toasts: {
            submitted: t("trade:limit.remove.tx.submitted"),
            success: t("trade:limit.remove.tx.success"),
            error: t("trade:limit.remove.tx.error"),
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
          },
        },
      )
    },
  })
}
