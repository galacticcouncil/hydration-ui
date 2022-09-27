import create from "zustand"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import type { ProviderType } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { ISubmittableResult } from "@polkadot/types/types"

export interface Account {
  name: string
  address: AccountId32 | string
  provider: ProviderType
}

export interface TransactionInput {
  title?: string
  tx: SubmittableExtrinsic
}

export interface Transaction extends TransactionInput {
  hash: string
  onSuccess?: (result: ISubmittableResult) => void
  onError?: () => void
}

interface Store {
  account?: Account
  setAccount: (account: Account | undefined) => void
  transactions?: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
  ) => Promise<ISubmittableResult>
  cancelTransaction: (hash: string) => void
}

export const useStore = create<Store>((set) => ({
  setAccount: (account) => set({ account }),
  createTransaction: (transaction) => {
    return new Promise<ISubmittableResult>((onSuccess, onError) => {
      const hash = transaction.tx.hash.toString()
      set((store) => ({
        transactions: [
          { ...transaction, hash, onSuccess, onError },
          ...(store.transactions?.filter((prev) => prev.hash !== hash) ?? []),
        ],
      }))
    })
  },
  cancelTransaction: (hash) => {
    set((store) => ({
      transactions: store.transactions?.filter(
        (transaction) => transaction.hash !== hash,
      ),
    }))
  },
}))
