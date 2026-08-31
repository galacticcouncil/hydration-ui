import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { queryOptions, useQueries } from "@tanstack/react-query"
import { differenceInMinutes } from "date-fns"
import { useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { useTransactionToastProcessorFn } from "@/modules/transactions/hooks/useTransactionToastProcessorFn"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionToastData,
  useToasts,
  useToastsStore,
} from "@/states/toasts"
import {
  TransactionType,
  TransactionXcSwapMeta,
  useTransactionsStore,
} from "@/states/transactions"

const TOAST_STALE_AFTER_MINUTES = 60

const isPendingOnChainToast = (toast: TransactionToastData) => {
  return (
    toast.variant === "pending" &&
    toast.meta.type === TransactionType.Onchain &&
    toast.meta.srcChainKey === HYDRATION_CHAIN_KEY
  )
}

const isSubmittedXcmToast = (toast: TransactionToastData) => {
  return (
    toast.variant === "submitted" && toast.meta.type === TransactionType.Xcm
  )
}

// Deliberately not gated on meta.sequence: a submitted toast is neither
// stale-swept nor retried, so one that never got a sequence has to enter the
// processing set for the processor to resolve it.
const isSubmittedXcSwapToast = (toast: TransactionToastData) => {
  return (
    toast.variant === "submitted" && toast.meta.type === TransactionType.XcSwap
  )
}

const isValidToastForProcessing = (toast: TransactionToastData) => {
  return (
    isPendingOnChainToast(toast) ||
    isSubmittedXcmToast(toast) ||
    isSubmittedXcSwapToast(toast)
  )
}

const isStaleToast = (toast: TransactionToastData) => {
  return (
    toast.variant === "pending" &&
    !isValidToastForProcessing(toast) &&
    differenceInMinutes(new Date(), new Date(toast.dateCreated)) >
      TOAST_STALE_AFTER_MINUTES
  )
}

const getToastProcessingRefetchInterval = (toast: TransactionToastData) => {
  const diffInMin = differenceInMinutes(new Date(), new Date(toast.dateCreated))
  // Process older toasts less frequently
  return diffInMin >= 5 ? 60_000 : 10_000
}

type XcSwapToastStatus = "success" | "error" | "warning" | "unknown"

export const useProcessTransactionToasts = (toasts: TransactionToastData[]) => {
  const { t } = useTranslation(["common", "trade"])
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

  const getXcSwapCopy = useCallback(
    (
      meta: TransactionXcSwapMeta,
      status: XcSwapToastStatus,
    ): { title?: string } => {
      const vars = {
        amount: meta.srcAmount,
        symbol: meta.srcAssetSymbol,
        dstSymbol: meta.dstAssetSymbol,
        dstChain: chainsMap.get(meta.dstChainKey)?.name ?? meta.dstChainKey,
      }

      switch (status) {
        case "success":
          return { title: t("trade:xc.swap.toast.success", vars) }
        case "warning":
          return { title: t("trade:xc.swap.toast.refunded", vars) }
        case "error":
          return { title: t("trade:xc.swap.toast.error", vars) }
        case "unknown":
          return {}
      }
    },
    [t],
  )

  useQueries({
    queries: toastsToProcess.map((toast) =>
      queryOptions({
        retry: false,
        enabled: isLoaded,
        notifyOnChangeProps: [],
        refetchInterval: getToastProcessingRefetchInterval(toast),
        queryKey: ["toast", "status", toast.id],
        queryFn: async () => {
          const result = await processToast(toast)

          if (!result.processed) return result

          const copy =
            toast.meta.type === TransactionType.XcSwap
              ? getXcSwapCopy(toast.meta, result.status)
              : {}

          edit(toast.id, {
            variant: result.status,
            link: result.link || toast.link,
            dateCreated: result.dateUpdated,
            ...copy,
          })

          return result
        },
      }),
    ),
  })
}
