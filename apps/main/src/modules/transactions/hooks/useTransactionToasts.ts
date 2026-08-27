import { etherscan, neckwork } from "@galacticcouncil/utils"
import {
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import {
  getDcaScheduleIdFromEvents,
  getExplorerTxLink,
  parseTxMethodName,
} from "@/modules/transactions/utils/tx"
import { useToasts } from "@/states/toasts"
import {
  isSubstrateTxResult,
  SingleTransaction,
  TransactionMeta,
  TransactionType,
  TSuccessResult,
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

  const isMultisig = !!multisigConfig && !!account?.isMultisig
  const isXcm = meta.type === TransactionType.Xcm

  const method = parseTxMethodName(transaction.tx, "value.value.call")

  // PAPI re-emits found:true on parachain re-orgs; show toast at most once
  const hasShownToastRef = useRef(false)

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    return {
      onSubmitted: (txHash) => {
        hasShownToastRef.current = false
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
      onSuccess: (result) => {
        if (isMultisig) {
          return remove(id)
        }

        const link = getFinalizedTransactionLink(meta, result)

        if (hasShownToastRef.current) {
          if (link) edit(id, { link })
          return
        }
        hasShownToastRef.current = true

        if (isXcm) {
          return edit(id, {
            variant: "submitted",
            dateCreated: new Date().toISOString(),
            ...(link && { link }),
          })
        }

        edit(id, {
          variant: "success",
          title: toasts?.success ?? t("transaction.status.success.title"),
          dateCreated: new Date().toISOString(),
          ...(link && { link }),
        })
      },
      onError: (message) => {
        if (hasShownToastRef.current) return
        hasShownToastRef.current = true
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
    isMultisig,
    isXcm,
    meta,
    method,
    pending,
    remove,
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
    meta.type === TransactionType.EvmApprove ||
    (meta.type === TransactionType.Xcm && ecosystem === CallType.Evm)
  ) {
    return etherscan.tx(meta.srcChainKey, txHash)
  }

  return neckwork.extrinsicHash(txHash)
}

function getFinalizedTransactionLink(
  meta: TransactionMeta,
  result: TSuccessResult,
) {
  if (!isSubstrateTxResult(result)) return null

  const scheduleId = getDcaScheduleIdFromEvents(result.events)
  if (scheduleId !== null) {
    return neckwork.activityDca(scheduleId)
  }

  const { number, index } = result.block
  return getExplorerTxLink(meta, number, index)
}
