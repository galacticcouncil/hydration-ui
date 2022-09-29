import create from "zustand"
import { persist } from "zustand/middleware"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { ISubmittableResult } from "@polkadot/types/types"
import { getWalletBySource } from "@talismn/connect-wallets"
import { POLKADOT_APP_NAME } from "utils/network"

export interface Account {
  name: string
  address: AccountId32 | string
  provider: string
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
  transactions?: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
  ) => Promise<ISubmittableResult>
  cancelTransaction: (hash: string) => void
}

export const useAccountStore = create(
  persist<{
    account?: Account
    setAccount: (account: Account | undefined) => void
  }>(
    (set) => ({
      setAccount: (account) => set({ account }),
    }),
    {
      name: "account",
      getStorage: () => ({
        async getItem(name: string) {
          // attempt to activate the account
          const value = window.localStorage.getItem(name)
          if (value == null) return value

          try {
            const { state } = JSON.parse(value)
            if (state.account?.provider == null) return null

            const wallet = getWalletBySource(state.account.provider)
            await wallet?.enable(POLKADOT_APP_NAME)
            const accounts = await wallet?.getAccounts()

            const foundAccount = accounts?.find(
              (i) => i.address === state.account.address,
            )

            if (!foundAccount) throw new Error("Account not found")
            return value
          } catch (err) {
            console.error(err)
            return null
          }
        },
        setItem(name, value) {
          window.localStorage.setItem(name, value)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      }),
    },
  ),
)

export const useStore = create<Store>((set) => ({
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
