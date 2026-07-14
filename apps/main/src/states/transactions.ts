import { AlertProps } from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY, uuid } from "@galacticcouncil/utils"
import { SolanaTxStatus } from "@galacticcouncil/web3-connect/src/signers/SolanaSigner"
import { SuiTxStatus } from "@galacticcouncil/web3-connect/src/signers/SuiSigner"
import { tags } from "@galacticcouncil/xc-cfg"
import { ComponentType } from "react"
import { TransactionReceipt } from "viem"
import { create } from "zustand"

import {
  AnyTransaction,
  TxBestBlocksStateResult,
  TxFinalizedResult,
} from "@/modules/transactions/types"

export const XcmTag = tags.Tag
export type XcmTags = Array<keyof typeof XcmTag>

export const BRIDGE_PROVIDER_TAGS: XcmTags = [
  XcmTag.Basejump,
  XcmTag.Wormhole,
  XcmTag.Snowbridge,
]

export enum TransactionType {
  Onchain = "Onchain",
  Xcm = "Xcm",
  EvmApprove = "EvmApprove",
}

export type TransactionAlert = Pick<
  AlertProps,
  "variant" | "title" | "description"
> & {
  requiresUserConsent?: boolean | string
}

export type TExecutedAmount = {
  amount: string
  assetId: string
}

export type TransactionCommon = {
  title?: string
  description?: string
  fee?: TransactionFee
  toasts?: TransactionToasts
  meta?: TransactionMeta
  invalidateQueries?: string[][]
  withExtraGas?: boolean | bigint
  isUnsigned?: boolean
  alerts?: TransactionAlert[]
  successMode?: "best" | "finalized"
  executedAmount?: TExecutedAmount
}

interface SingleTransactionInput extends TransactionCommon {
  tx: AnyTransaction
}

type SingleTransactionInputDynamic = {
  tx: (
    results: TTransactionResult[],
  ) => Promise<SingleTransactionInput> | SingleTransactionInput
}

export type MultiTransactionConfig = (
  | SingleTransactionInput
  | SingleTransactionInputDynamic
) & {
  stepTitle: string
  pendingComponent?: ComponentType
  //@TODO consider separate all transaction actions per tx
  onSubmitted?: (txHash: string) => void
}

interface MultiTransactionInput {
  tx: MultiTransactionConfig[]
}

export type TransactionInput = SingleTransactionInput | MultiTransactionInput

export type TransactionProps = Omit<TransactionInput, "meta"> & {
  meta: TransactionMeta
}

export interface TransactionToasts {
  submitted: string
  success: string
  error?: string
}

type TransactionFee = {
  feeAmount?: string
  feeBalance?: string
  feeSymbol?: string
  feePaymentAssetId?: string
}

type TransactionMetaCommon = {
  srcChainKey: string
}

export type TransactionOnchainMeta = TransactionMetaCommon & {
  type: TransactionType.Onchain
}

export type TransactionXcmMeta = TransactionMetaCommon & {
  type: TransactionType.Xcm
  srcChainFee: string
  srcChainFeeSymbol: string
  dstChainKey: string
  dstChainFee?: string
  dstChainFeeSymbol?: string
  tags: XcmTags
}

export type TransactionErc20ApproveMeta = TransactionMetaCommon & {
  type: TransactionType.EvmApprove
}

export type TransactionMeta =
  | TransactionOnchainMeta
  | TransactionXcmMeta
  | TransactionErc20ApproveMeta

export type TSuccessResult =
  | TxBestBlocksStateResult
  | TxFinalizedResult
  | TransactionReceipt
  | SolanaTxStatus
  | SuiTxStatus

export type TFinalizedResult =
  | TxFinalizedResult
  | TransactionReceipt
  | SolanaTxStatus
  | SuiTxStatus

export type TTransactionResult = TSuccessResult | TFinalizedResult

export interface TransactionActions {
  onSuccess?: (event: TTransactionResult) => void
  onSubmitted?: (txHash: string) => void
  onError?: (message: string) => void
  onClose?: () => void
}

export interface TransactionOptions extends TransactionActions {
  onBack?: () => void
  resolveOn?: "submitted" | "success"
}

export type SingleTransaction = SingleTransactionInput &
  TransactionProps &
  TransactionActions & {
    id: string
  }

export type MultiTransaction = MultiTransactionInput &
  TransactionProps &
  TransactionActions & {
    id: string
  }

export type Transaction = SingleTransaction | MultiTransaction

export const isMultiTransaction = (
  transaction: Transaction,
): transaction is MultiTransaction => {
  return Array.isArray(transaction.tx)
}

export const isSingleTransaction = (
  transaction: Transaction,
): transaction is SingleTransaction => {
  return !Array.isArray(transaction.tx)
}

export const isSubstrateTxResult = (
  result: TSuccessResult,
): result is TxBestBlocksStateResult => {
  return (
    "type" in result &&
    (result.type === "txBestBlocksState" || result.type === "finalized")
  )
}

export const isBridgeTransaction = (meta: TransactionMeta) => {
  return (
    meta.type === TransactionType.Xcm &&
    meta.tags.some((tag) => BRIDGE_PROVIDER_TAGS.includes(tag))
  )
}

export type PendingTransaction = {
  id: string
  meta: TransactionMeta
  nonce: number
  address: string
  isPermit: boolean
}

const PendingTxChannel = new BroadcastChannel("hydration:pending-tx")

type PendingTxMessage =
  | { type: "add"; transaction: PendingTransaction }
  | { type: "remove"; id: string }

interface TransactionsStore {
  transactions: Transaction[]
  pendingTransactions: PendingTransaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: TransactionOptions,
  ) => Promise<TTransactionResult | void>
  cancelTransaction: (id: string) => void
  addPendingTransaction: (transaction: PendingTransaction) => void
  removePendingTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  pendingTransactions: [],
  createTransaction: (transaction, options) => {
    return new Promise<TTransactionResult | void>((resolve, reject) => {
      set((state) => {
        const meta: TransactionMeta =
          "meta" in transaction && transaction.meta
            ? transaction.meta
            : {
                type: TransactionType.Onchain,
                srcChainKey: HYDRATION_CHAIN_KEY,
              }
        const newTransaction: Transaction = {
          id: uuid(),
          ...transaction,
          meta,
          onSubmitted: (txHash) => {
            options?.onSubmitted?.(txHash)
            if (!options?.resolveOn || options?.resolveOn === "submitted") {
              resolve()
            }
          },
          onSuccess: (event) => {
            options?.onSuccess?.(event)
            resolve(event)
          },
          onError: (message) => {
            options?.onError?.(message)
            reject(message)
          },
          onClose: () => {
            options?.onClose?.()
            reject("Transaction closed")
          },
        }
        return {
          transactions: [newTransaction, ...(state.transactions ?? [])],
        }
      })
    })
  },
  cancelTransaction: (id) => {
    set((store) => ({
      transactions: store.transactions.filter(
        (transaction) => transaction.id !== id,
      ),
    }))
  },
  addPendingTransaction: (transaction) => {
    set((state) => ({
      pendingTransactions: [...state.pendingTransactions, transaction],
    }))
    PendingTxChannel.postMessage({ type: "add", transaction })
  },
  removePendingTransaction: (id) => {
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter((p) => p.id !== id),
    }))
    PendingTxChannel.postMessage({ type: "remove", id })
  },
}))

PendingTxChannel.onmessage = (event: MessageEvent<PendingTxMessage>) => {
  const message = event.data
  switch (message.type) {
    case "add":
      useTransactionsStore.setState((state) =>
        state.pendingTransactions.some((p) => p.id === message.transaction.id)
          ? state
          : {
              pendingTransactions: [
                ...state.pendingTransactions,
                message.transaction,
              ],
            },
      )
      break
    case "remove":
      useTransactionsStore.setState((state) => ({
        pendingTransactions: state.pendingTransactions.filter(
          (p) => p.id !== message.id,
        ),
      }))
      break
  }
}
