import {
  etherscan,
  HYDRATION_CHAIN_KEY,
  subscan,
  wormholescan,
} from "@galacticcouncil/utils"
import { useAccount, useMultisigStore } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TxStatusCallbacks } from "@/modules/transactions/types"
import { useToasts } from "@/states/toasts"
import { TxBestBlocksStateResult } from "@/modules/transactions/types"
import {
  isBridgeTransaction,
  SingleTransaction,
  TransactionMeta,
  TransactionType,
  XcmTag,
} from "@/states/transactions"
import { useMultisigWatchStore } from "@/states/multisigWatch"

const MULTIX_BASE_URL = "https://multix.cloud"

export const useTransactionToasts = (
  transaction: SingleTransaction,
  ecosystem: CallType,
) => {
  const { t } = useTranslation()
  const { pending, edit } = useToasts()
  const { account } = useAccount()
  const { getActiveConfig } = useMultisigStore()
  const { addWatch } = useMultisigWatchStore()

  const { id, toasts, meta } = transaction

  const isBridge = isBridgeTransaction(meta)
  const isMultisig = !!account?.isMultisig

  return useMemo<Omit<TxStatusCallbacks, "onFinalized">>(() => {
    return {
      onSubmitted: (txHash) => {
        if (isMultisig) {
          const config = getActiveConfig()
          const multisigAddress = account?.address
          const multixUrl = multisigAddress
            ? `${MULTIX_BASE_URL}/?network=hydration&address=${multisigAddress}`
            : undefined

          pending({
            id,
            title:
              toasts?.submitted ??
              t("transaction.status.multisig.submitted.title"),
            link: multixUrl,
            hint: config
              ? t("transaction.status.multisig.submitted.hint", {
                  threshold: config.threshold,
                  total: config.signers.length,
                })
              : undefined,
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
      onSuccess: (event) => {
        if (isMultisig) {
          // For multisig, the first approval was confirmed on-chain.
          // Extract the callHash from Multisig.NewMultisig event and start polling
          // for when all co-signers approve (storage entry disappears = executed).
          const papiEvent = event as TxBestBlocksStateResult
          if (papiEvent?.events) {
            const newMultisigEvent = papiEvent.events.find(
              (e) =>
                e.type === "Multisig" &&
                (e.value as { type: string }).type === "NewMultisig",
            )
            if (newMultisigEvent) {
              const callHashBinary = (
                newMultisigEvent.value as {
                  type: string
                  value: { call_hash: { asHex: () => string } }
                }
              ).value.call_hash
              const multisigAddress = account?.address
              if (multisigAddress) {
                addWatch({
                  toastId: id,
                  multisigAddress,
                  callHash: callHashBinary.asHex(),
                  startedAt: Date.now(),
                })
              }
            }
          }
          return
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
    account?.address,
    addWatch,
    ecosystem,
    edit,
    getActiveConfig,
    id,
    isBridge,
    isMultisig,
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
