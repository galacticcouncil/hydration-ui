import { uuid } from "@galacticcouncil/utils"
import { Call, EvmCall } from "@galacticcouncil/xcm-sdk"
import { Transaction as PapiTx } from "polkadot-api"
import { create } from "zustand"

export type AnyPapiTx = PapiTx<object, string, string, unknown>
export type AnyTransaction = AnyPapiTx | Call | EvmCall

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
