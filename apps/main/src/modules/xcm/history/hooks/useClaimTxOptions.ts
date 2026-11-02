import type { AnyChain } from "@galacticcouncil/xc-core"
import { CallType } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { useToasts } from "@/states/toasts"
import { TransactionType } from "@/states/transactions"

type ToastParams = { value: string; symbol: string; chainName: string }
type Callbacks = {
  onSubmitted?: (txHash: string) => void
  onSuccess?: () => void
  onError?: (error: string) => void
  onFinalized?: () => void
  createLink?: (txHash: string) => string
  /** Toast titles of a transaction other than the claim itself. */
  titles?: { submitted: string; success: string; error: string }
}

export function useClaimTxOptions(toastParams: ToastParams) {
  const { t } = useTranslation("common")
  const { pending, edit } = useToasts()

  return (chain: AnyChain, ecosystem: CallType, callbacks?: Callbacks) => {
    let toastId: string | undefined = undefined
    return {
      chainKey: chain.key,
      onSubmitted: (txHash: string) => {
        callbacks?.onSubmitted?.(txHash)
        toastId = pending({
          ...(callbacks?.createLink && { link: callbacks.createLink(txHash) }),
          title:
            callbacks?.titles?.submitted ??
            t("claim.toast.submitted", toastParams),
          meta: {
            type: TransactionType.Onchain,
            srcChainKey: chain.key,
            txHash,
            ecosystem,
          },
        })
      },
      onSuccess: () => {
        callbacks?.onSuccess?.()
        if (toastId) {
          edit(toastId, {
            variant: "success",
            title:
              callbacks?.titles?.success ??
              t("claim.toast.success", toastParams),
          })
        }
      },
      onError: (error: string) => {
        callbacks?.onError?.(error)
        if (toastId) {
          edit(toastId, {
            variant: "error",
            title:
              callbacks?.titles?.error ?? t("claim.toast.error", toastParams),
            hint: error,
          })
        }
      },
      onFinalized: () => {
        callbacks?.onFinalized?.()
      },
    }
  }
}
