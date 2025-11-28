import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions, useQueries } from "@tanstack/react-query"
import { prop } from "remeda"

import { useTransactionToastProcessorFn } from "@/modules/transactions/hooks/useTransactionToastProcessorFn"
import { useRpcProvider } from "@/providers/rpcProvider"
import { ToastData, useToasts } from "@/states/toasts"
import {
  isBridgeTransaction,
  TransactionType,
  useTransactionsStore,
} from "@/states/transactions"

const isPendingOnChainToast = (toast: ToastData) => {
  return (
    toast.variant === "pending" && toast.meta.type === TransactionType.Onchain
  )
}

const isSubmittedBridgeToast = (toast: ToastData) => {
  return toast.variant === "submitted" && isBridgeTransaction(toast.meta)
}

const isValidToastForProcessing = (toast: ToastData) => {
  return isPendingOnChainToast(toast) || isSubmittedBridgeToast(toast)
}

export const useProcessTransactionToasts = (toasts: ToastData[]) => {
  const { isLoaded } = useRpcProvider()
  const { edit } = useToasts()
  const transactions = useTransactionsStore(prop("transactions"))

  const toastsToProcess = toasts.filter(
    (toast) =>
      isValidToastForProcessing(toast) &&
      // make sure we don't process toasts of transactions that are not finalized yet
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
            link: result.link || toast.link,
            dateCreated: result.dateUpdated,
          })

          return result
        },
      }),
    ),
  })
}
