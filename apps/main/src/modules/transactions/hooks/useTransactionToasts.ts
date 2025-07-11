import { subscan } from "@galacticcouncil/utils"
import { CallType } from "@galacticcouncil/xcm-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import { useToasts } from "@/states/toasts"
import { Transaction } from "@/states/transactions"

export const useTransactionToasts = (
  transaction: Transaction,
  ecosystem: CallType,
) => {
  const { t } = useTranslation()
  const { pending, edit } = useToasts()

  const { id, toasts, meta } = transaction

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    return {
      onSubmitted: (txHash) => {
        pending({
          id,
          title: toasts?.submitted ?? t("transaction.status.submitted.title"),
          link: subscan.tx(meta.srcChainKey, txHash),
          meta: {
            ...meta,
            txHash,
            ecosystem,
          },
        })
      },
      onSuccess: () => {
        edit(id, {
          variant: "success",
          title: toasts?.success ?? t("transaction.status.success.title"),
          dateCreated: new Date().toISOString(),
        })
      },
      onError: (message) => {
        edit(id, {
          variant: "error",
          title: toasts?.error ?? t("transaction.status.error.title"),
          dateCreated: new Date().toISOString(),
          hint: message,
        })
      },
    }
  }, [
    ecosystem,
    edit,
    id,
    meta,
    pending,
    t,
    toasts?.error,
    toasts?.submitted,
    toasts?.success,
  ])
}
