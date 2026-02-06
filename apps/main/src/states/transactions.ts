import { HYDRATION_CHAIN_KEY, uuid } from "@galacticcouncil/utils"
import { SolanaTxStatus } from "@galacticcouncil/web3-connect/src/signers/SolanaSigner"
import { SuiTxStatus } from "@galacticcouncil/web3-connect/src/signers/SuiSigner"
import { tags } from "@galacticcouncil/xc-cfg"
import { TransactionReceipt } from "viem"
import { create } from "zustand"

import {
  AnyTransaction,
  TxBestBlocksStateResult,
  TxFinalizedResult,
} from "@/modules/transactions/types"

export const XcmTag = tags.Tag
export type XcmTags = Array<keyof typeof XcmTag>

export const XCM_BRIDGE_TAGS: XcmTags = [XcmTag.Wormhole, XcmTag.Snowbridge]

export enum TransactionType {
  Onchain = "Onchain",
  Xcm = "Xcm",
  EvmApprove = "EvmApprove",
}

export type TransactionCommon = {
  title?: string
  description?: string
  fee?: TransactionFee
  toasts?: TransactionToasts
  meta?: TransactionMeta
  invalidateQueries?: string[][]
  withExtraGas?: boolean | bigint
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

export const isBridgeTransaction = (meta: TransactionMeta) => {
  return (
    meta.type === TransactionType.Xcm &&
    meta.tags.some((tag) => XCM_BRIDGE_TAGS.includes(tag))
  )
}

export type PendingTransaction = {
  id: string
  meta: TransactionMeta
  nonce: number
}

interface TransactionsStore {
  transactions: Transaction[]
  pendingTransactions: PendingTransaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: TransactionOptions,
  ) => Promise<TSuccessResult>
  cancelTransaction: (id: string) => void
  addPendingTransaction: (
    id: string,
    nonce: number,
    meta: TransactionMeta,
  ) => void
  removePendingTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  pendingTransactions: [],
  createTransaction: (transaction, options) => {
    return new Promise<TSuccessResult>((resolve, reject) => {
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
          onSubmitted: options?.onSubmitted,
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
  addPendingTransaction: (id, nonce, meta) => {
    set((state) => ({
      pendingTransactions: [...state.pendingTransactions, { id, meta, nonce }],
    }))
  },
  removePendingTransaction: (id) => {
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter((p) => p.id !== id),
    }))
  },
}))
