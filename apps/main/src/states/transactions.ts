import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { Transaction as AnyPapiTx } from "@galacticcouncil/sdk-next/build/types/tx"
import { uuid } from "@galacticcouncil/utils"
import { Call } from "@galacticcouncil/xcm-sdk"
import { create } from "zustand"

export type { AnyPapiTx }
export type AnyTransaction = AnyPapiTx | Call | ExtendedEvmCall

export interface TransactionInput {
  tx: AnyTransaction
  title?: string
  description?: string
  steps?: unknown[]
  toasts?: TrasactionToats
  meta?: TransactionMeta
}

export interface TrasactionToats {
  submitted: string
  success: string
  error: string
}

export interface TransactionMeta {
  chainKey?: string
  fee?: string
  feeBalance?: string
  feeSymbol?: string
  feePaymentAssetId?: string
  dstChainKey?: string
  dstChainFee?: string
  dstChainFeeSymbol?: string
}

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

export interface Transaction extends TransactionInput, TransactionActions {
  id: string
}

interface TransactionsStore {
  transactions: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: TransactionOptions,
  ) => Promise<unknown>
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
              ...transaction,
              id: uuid(),
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
