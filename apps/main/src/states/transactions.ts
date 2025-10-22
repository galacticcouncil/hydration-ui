import { HYDRATION_CHAIN_KEY, uuid } from "@galacticcouncil/utils"
import { tags } from "@galacticcouncil/xcm-cfg"
import { create } from "zustand"

import { AnyTransaction } from "@/modules/transactions/types"

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
  steps?: unknown[]
  fee?: TransactionFee
  toasts?: TransactionToasts
  meta?: TransactionMeta
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

export interface TransactionActions {
  onSuccess?: () => void
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

interface TransactionsStore {
  transactions: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: TransactionOptions,
  ) => Promise<void>
  cancelTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  createTransaction: (transaction, options) => {
    return new Promise<void>((resolve, reject) => {
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
              onSuccess: () => {
                options?.onSuccess?.()
                resolve()
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
