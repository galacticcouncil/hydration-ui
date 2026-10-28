import {
  etherscan,
  intentscan,
  nearblocks,
  neckwork,
  zcashexplorer,
} from "@galacticcouncil/utils"
import {
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { type TFunction } from "i18next"
import { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import { getSuccessToastUpdate } from "@/modules/transactions/utils/toasts/successToastUpdate"
import { parseTxMethodName } from "@/modules/transactions/utils/tx"
import { useToasts } from "@/states/toasts"
import {
  SingleTransaction,
  TransactionMeta,
  TransactionType,
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

  const method = parseTxMethodName(transaction.tx, "value.value.call")

  // PAPI re-emits found:true on parachain re-orgs, and the result is checked
  // again at finality: the toast changes only when the outcome does
  const shownRef = useRef<"success" | "error" | null>(null)
  const txHashRef = useRef<string | undefined>(undefined)

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    return {
      onSubmitted: (txHash) => {
        shownRef.current = null
        txHashRef.current = txHash
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

        const update = getSuccessToastUpdate(
          meta,
          result,
          toasts?.success ?? t("transaction.status.success.title"),
        )

        if (shownRef.current === "success") {
          if (update.link) edit(id, { link: update.link })
          return
        }
        shownRef.current = "success"

        const txHash = txHashRef.current
        edit(id, {
          variant: update.variant,
          // a failure re-executed as a success drops the failure's hint
          hint: undefined,
          ...(update.title && { title: update.title }),
          dateCreated: new Date().toISOString(),
          ...(update.link && { link: update.link }),
          ...(update.meta &&
            txHash && { meta: { ...update.meta, txHash, ecosystem } }),
        })
      },
      onError: (message) => {
        if (shownRef.current === "error") return
        shownRef.current = "error"
        edit(id, {
          variant: "error",
          title:
            toasts?.error ??
            toasts?.submitted ??
            t("transaction.status.error.title"),
          dateCreated: new Date().toISOString(),
          hint: describeTxError(message, t),
        })
      },
    }
  }, [
    ecosystem,
    edit,
    id,
    isMultisig,
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

/**
 * A permit (EVM wallet) is validated by re-running its call before it enters
 * the pool; a failure there only returns the pallet error's index, so name
 * what it means instead of showing the code.
 */
const describeTxError = (message: string, t: TFunction) => {
  if (message === "Invalid.Custom.10")
    return t("transaction.error.permitWouldFail")
  if (message === "Invalid.Custom.9") return t("transaction.error.permitStale")
  return message
}

function getTransactionLink(
  ecosystem: CallType,
  meta: TransactionMeta,
  txHash: string,
) {
  if (meta.type === TransactionType.XcSwap && meta.sequence) {
    return intentscan.order(meta.sequence)
  }

  // Ahead of the approve check, as NEAR prerequisites carry its meta too
  if (ecosystem === CallType.Near) {
    return nearblocks.tx(meta.srcChainKey, txHash)
  }

  if (ecosystem === CallType.Zec) {
    return zcashexplorer.tx(meta.srcChainKey, txHash)
  }

  if (
    meta.type === TransactionType.EvmApprove ||
    (meta.type === TransactionType.Xcm && ecosystem === CallType.Evm)
  ) {
    return etherscan.tx(meta.srcChainKey, txHash)
  }

  return neckwork.extrinsicHash(txHash)
}
