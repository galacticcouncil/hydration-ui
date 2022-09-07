import create from "zustand"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"

interface Account {
  name: string
  address: string
}

export interface Transaction {
  hash: string
  title?: string
  tx: SubmittableExtrinsic
}

interface Store {
  account?: Account
  setAccount: (account: Account) => void
  transactions?: Transaction[]
  createTransaction: (transaction: Transaction) => void
  cancelTransaction: (hash: string) => void
}

export const useStore = create<Store>((set) => ({
  setAccount: (account) =>
    set({
      account,
    }),
  createTransaction: (transaction) => {
    set((store) => {
      return {
        transactions: [
          {
            ...transaction,
          },
          ...(store.transactions?.filter(
            (prev) => prev.hash !== transaction.hash,
          ) ?? []),
        ],
      }
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
