import {
  etherscan,
  HYDRATION_CHAIN_KEY,
  subscan,
  wormholescan,
} from "@galacticcouncil/utils"
import { CallType } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import { useToasts } from "@/states/toasts"
import {
  isBridgeTransaction,
  SingleTransaction,
  TransactionMeta,
  TransactionType,
  XcmTag,
} from "@/states/transactions"

export const useTransactionToasts = (
  transaction: SingleTransaction,
  ecosystem: CallType,
) => {
  const { t } = useTranslation()
  const { pending, edit } = useToasts()

  const { id, toasts, meta } = transaction

  const isBridge = isBridgeTransaction(meta)

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    return {
      onSubmitted: (txHash) => {
        pending({
          id,
          title: toasts?.submitted ?? t("transaction.status.submitted.title"),
          link: getTransactionLink(ecosystem, meta, txHash),
          meta: {
            ...meta,
            txHash,
            ecosystem,
          },
        })
      },
      onSuccess: () => {
        if (isBridge) {
          return edit(id, {
            variant: "submitted",
            dateCreated: new Date().toISOString(),
          })
        }

        edit(id, {
          variant: "success",
          title: toasts?.success ?? t("transaction.status.success.title"),
          dateCreated: new Date().toISOString(),
        })
      },
      onError: (message) => {
        edit(id, {
          variant: "error",
          title:
            toasts?.error ??
            toasts?.submitted ??
            t("transaction.status.error.title"),
          dateCreated: new Date().toISOString(),
          hint: message,
        })
      },
    }
  }, [
    ecosystem,
    edit,
    id,
    isBridge,
    meta,
    pending,
    t,
    toasts?.error,
    toasts?.submitted,
    toasts?.success,
  ])
}

function getTransactionLink(
  ecosystem: CallType,
  meta: TransactionMeta,
  txHash: string,
) {
  if (
    meta.type === TransactionType.Xcm &&
    meta.srcChainKey !== HYDRATION_CHAIN_KEY &&
    meta.tags.includes(XcmTag.Wormhole)
  ) {
    return wormholescan.tx(txHash)
  }

  if (
    meta.type === TransactionType.EvmApprove ||
    (meta.type === TransactionType.Xcm && ecosystem === CallType.Evm)
  ) {
    return etherscan.tx(meta.srcChainKey, txHash)
  }

  return subscan.tx(meta.srcChainKey, txHash)
}
