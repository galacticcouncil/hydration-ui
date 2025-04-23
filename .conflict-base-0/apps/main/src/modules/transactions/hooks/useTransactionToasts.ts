import { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import { useToasts } from "@/states/toasts"
import { TrasactionToats } from "@/states/transactions"

export const useTransactionToasts = (messages?: TrasactionToats) => {
  const { t } = useTranslation()
  const toasts = useToasts()
  const toastsRef = useRef(toasts)

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    const { successToast, errorToast, loadingToast } = toastsRef.current
    return {
      onSubmitted: (txHash) => {
        loadingToast({
          title: messages?.submitted ?? t("transaction.status.submitted.title"),
          txHash,
        })
      },
      onSuccess: () => {
        successToast({
          title: messages?.success ?? t("transaction.status.success.title"),
        })
      },
      onError: () => {
        errorToast({
          title: messages?.error ?? t("transaction.status.error.title"),
        })
      },
    }
  }, [messages?.error, messages?.submitted, messages?.success, t])
}
