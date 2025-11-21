import { HYDRATION_CHAIN_KEY, uuid } from "@galacticcouncil/utils"
import { tags } from "@galacticcouncil/xcm-cfg"
import { TransactionReceipt } from "viem"
import { create } from "zustand"

import {
  AnyTransaction,
  TxBestBlocksStateResult,
} from "@/modules/transactions/types"

export const XcmTag = tags.Tag
export type XcmTags = Array<keyof typeof XcmTag>

export enum TransactionType {
  Onchain = "Onchain",
  Xcm = "Xcm",
}

export interface TransactionInput {
  tx: AnyTransaction
  title?: string
  description?: string
  steps?: string[]
  fee?: TransactionFee
  toasts?: TransactionToasts
  meta?: TransactionMeta
  disableAutoClose?: boolean
}

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

type TransactionMetaCommons = {
  srcChainKey: string
}

export type TransactionOnchainMeta = TransactionMetaCommons & {
  type: TransactionType.Onchain
}

export type TransactionXcmMeta = TransactionMetaCommons & {
  type: TransactionType.Xcm
  dstChainKey: string
  dstChainFee?: string
  dstChainFeeSymbol?: string
  tags?: XcmTags
}

export type TransactionMeta = TransactionOnchainMeta | TransactionXcmMeta
export type TSuccessResult = TxBestBlocksStateResult | TransactionReceipt

export interface TransactionActions {
  onSuccess?: (event: TSuccessResult) => void
  onSubmitted?: (txHash: string) => void
  onError?: (message: string) => void
  onClose?: () => void
}

export interface TransactionOptions extends TransactionActions {
  onBack?: () => void
  onClose?: () => void
}

export interface Transaction extends TransactionProps, TransactionActions {
  id: string
}

export const isSubstrateTxResult = (
  result: TSuccessResult,
): result is TxBestBlocksStateResult => {
  return "type" in result && result.type === "txBestBlocksState"
}

interface TransactionsStore {
  transactions: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: TransactionOptions,
  ) => Promise<TSuccessResult>
  cancelTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  createTransaction: (transaction, options) => {
    return new Promise<TSuccessResult>((resolve, reject) => {
      set((state) => {
        return {
          transactions: [
            {
              id: uuid(),
              ...transaction,
              meta: transaction?.meta ?? {
                type: TransactionType.Onchain,
                srcChainKey: HYDRATION_CHAIN_KEY,
              },
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
            },
            ...(state.transactions ?? []),
          ],
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
}))
