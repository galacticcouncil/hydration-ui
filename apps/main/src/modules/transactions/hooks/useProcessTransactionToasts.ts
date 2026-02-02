import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQueries } from "@tanstack/react-query"
import { differenceInMinutes } from "date-fns"
import { useEffect } from "react"
import { prop } from "remeda"

import { useTransactionToastProcessorFn } from "@/modules/transactions/hooks/useTransactionToastProcessorFn"
import { useRpcProvider } from "@/providers/rpcProvider"
import { ToastData, useToasts, useToastsStore } from "@/states/toasts"
import {
  isBridgeTransaction,
  TransactionType,
  useTransactionsStore,
} from "@/states/transactions"

const TOAST_STALE_AFTER_MINUTES = 60

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

const isStaleToast = (toast: ToastData) => {
  return (
    toast.variant === "pending" &&
    !isValidToastForProcessing(toast) &&
    differenceInMinutes(new Date(), new Date(toast.dateCreated)) >
      TOAST_STALE_AFTER_MINUTES
  )
}

export const useProcessTransactionToasts = (toasts: ToastData[]) => {
  const { isLoaded } = useRpcProvider()
  const { edit } = useToasts()
  const { update } = useToastsStore()
  const { account } = useAccount()
  const transactions = useTransactionsStore(prop("transactions"))

  const toastsToMarkAsUnknown = toasts.filter(isStaleToast)
  useEffect(() => {
    if (account && toastsToMarkAsUnknown.length > 0) {
      const staleToastsIds = toastsToMarkAsUnknown.map(prop("id"))
      update(account.address, (toasts) =>
        toasts.map((toast) =>
          staleToastsIds.includes(toast.id)
            ? { ...toast, variant: "unknown" }
            : toast,
        ),
      )
    }
  }, [account, toastsToMarkAsUnknown, update])

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
