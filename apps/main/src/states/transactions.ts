import { AlertProps } from "@galacticcouncil/ui/components"
import { ActivityType, HYDRATION_CHAIN_KEY, uuid } from "@galacticcouncil/utils"
import { SolanaTxStatus } from "@galacticcouncil/web3-connect/src/signers/SolanaSigner"
import { SuiTxStatus } from "@galacticcouncil/web3-connect/src/signers/SuiSigner"
import { tags } from "@galacticcouncil/xc-cfg"
import { Asset } from "@galacticcouncil/xc-core"
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

// Order matters - getPrimaryBridgeTag takes the first match, and an executor
// route carries Wormhole too. NttExecutor has to win, or both Wormhole
// variants collapse to one indistinguishable option and the executor route
// becomes unreachable.
export const BRIDGE_PROVIDER_TAGS: XcmTags = [
  XcmTag.Basejump,
  XcmTag.NttExecutor,
  XcmTag.Wormhole,
  XcmTag.Snowbridge,
]

export enum TransactionType {
  Onchain = "Onchain",
  Xcm = "Xcm",
  EvmApprove = "EvmApprove",
  XcSwap = "XcSwap",
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
  signerFeeAsset?: Asset
  invalidateQueries?: string[][]
  withExtraGas?: boolean | bigint
  isUnsigned?: boolean
  alerts?: TransactionAlert[]
  executedAmount?: TExecutedAmount
  activity?: ActivityType
}

interface SingleTransactionInput extends TransactionCommon {
  tx: AnyTransaction
}

type SingleTransactionInputDynamic = {
  tx: (
    results: TSuccessResult[],
  ) => Promise<SingleTransactionInput> | SingleTransactionInput
}

type MultiTransactionConfig = (
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
  activity?: ActivityType
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

export type TransactionXcSwapMeta = TransactionMetaCommon & {
  type: TransactionType.XcSwap
  srcAssetSymbol: string
  srcAmount: string
  srcChainFee: string
  srcChainFeeSymbol: string
  dstChainKey: string
  dstAssetSymbol: string
  dstAmount: string
  dstAddress: string
  dstChainFee?: string
  dstChainFeeSymbol?: string
  intentId?: string
  depositAddress?: string
  correlationId?: string
}

export type TransactionMeta =
  | TransactionOnchainMeta
  | TransactionXcmMeta
  | TransactionErc20ApproveMeta
  | TransactionXcSwapMeta

export type TSuccessResult =
  | TxBestBlocksStateResult
  | TransactionReceipt
  | SolanaTxStatus
  | SuiTxStatus

export type TFinalizedResult =
  | TxFinalizedResult
  | TransactionReceipt
  | SolanaTxStatus
  | SuiTxStatus

export interface TransactionActions {
  onSuccess?: (event: TSuccessResult) => void
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
  return "type" in result && result.type === "txBestBlocksState"
}

/**
 * Hydration block the tx landed in, for the substrate and EVM paths — the EVM
 * runs on the same chain, so its receipt block number is directly comparable.
 * Solana and Sui results are from other chains and yield null.
 */
export const getTxResultBlockHeight = (
  result: TSuccessResult,
): number | null => {
  if (isSubstrateTxResult(result)) return result.block.number
  if ("blockNumber" in result && typeof result.blockNumber === "bigint") {
    return Number(result.blockNumber)
  }
  return null
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
  ) => Promise<TSuccessResult | void>
  cancelTransaction: (id: string) => void
  addPendingTransaction: (transaction: PendingTransaction) => void
  removePendingTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  pendingTransactions: [],
  createTransaction: (transaction, options) => {
    return new Promise<TSuccessResult | void>((resolve, reject) => {
      set((state) => {
        const meta: TransactionMeta = {
          ...("meta" in transaction && transaction.meta
            ? transaction.meta
            : {
                type: TransactionType.Onchain,
                srcChainKey: HYDRATION_CHAIN_KEY,
              }),
          ...("activity" in transaction &&
            transaction.activity && { activity: transaction.activity }),
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
