import {
  etherscan,
  HYDRATION_CHAIN_KEY,
  subscan,
  wormholescan,
} from "@galacticcouncil/utils"
import {
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import { parseTxMethodName } from "@/modules/transactions/utils/tx"
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
  const { account } = useAccount()
  const { pending, remove, edit } = useToasts()
  const multisigConfig = useActiveMultisigConfig()

  const { id, toasts, meta } = transaction

  const isBridge = isBridgeTransaction(meta)
  const isMultisig = !!multisigConfig && !!account?.isMultisig

  const method = parseTxMethodName(transaction.tx, "value.value.call")

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    return {
      onSubmitted: (txHash) => {
        if (isMultisig) {
          pending({
            id,
            title: method
              ? t("multisig.toast.named.title", { method })
              : t("multisig.toast.unnamed.title"),
            link: getTransactionLink(ecosystem, meta, txHash),
            meta: {
              ...meta,
              txHash,
              ecosystem,
            },
          })
          return
        }
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
        if (isMultisig) {
          return remove(id)
        }
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
    isMultisig,
    meta,
    pending,
    remove,
    t,
    toasts?.error,
    toasts?.submitted,
    toasts?.success,
    method,
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
