import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions, useQueries } from "@tanstack/react-query"
import { prop } from "remeda"

import { useTransactionToastProcessorFn } from "@/modules/transactions/hooks/useTransactionToastProcessorFn"
import { useRpcProvider } from "@/providers/rpcProvider"
import { ToastData, useToasts } from "@/states/toasts"
import { useTransactionsStore } from "@/states/transactions"

export const useProcessTransactionToasts = (toasts: ToastData[]) => {
  const { isLoaded } = useRpcProvider()
  const { edit } = useToasts()
  const transactions = useTransactionsStore(prop("transactions"))

  const toastsToProcess = toasts.filter(
    (toast) =>
      toast.variant === "pending" &&
      !transactions.some((transaction) => transaction.id === toast.id),
  )

  const processToast = useTransactionToastProcessorFn()

  useQueries({
    queries: toastsToProcess.map((toast) =>
      queryOptions({
        retry: false,
        enabled: isLoaded,
        notifyOnChangeProps: [],
        queryKey: [QUERY_KEY_BLOCK_PREFIX, "toast", "status", toast.id],
        queryFn: async () => {
          const result = await processToast(toast)

          if (!result.processed) return result

          edit(toast.id, {
            variant: result.status,
            dateCreated: result.dateUpdated,
          })

          return result
        },
      }),
    ),
  })
}
