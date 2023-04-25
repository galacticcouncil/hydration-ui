import create from "zustand"
import { persist } from "zustand/middleware"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { ISubmittableResult } from "@polkadot/types/types"
import { getWalletBySource } from "@talismn/connect-wallets"
import { POLKADOT_APP_NAME } from "utils/api"
import { v4 as uuid } from "uuid"
import { ReactElement } from "react"
import BigNumber from "bignumber.js"
import { safeConvertAddressSS58 } from "utils/formatting"

export interface ToastMessage {
  onLoading?: ReactElement
  onSuccess?: ReactElement
  onError?: ReactElement
}

export interface Account {
  name: string
  address: string
  provider: string
  isExternalWalletConnected: boolean
  delegate?: string
}

export interface TransactionInput {
  title?: string
  tx: SubmittableExtrinsic
  overrides?: {
    fee: BigNumber
    currencyId?: string
  }
}

export interface Transaction extends TransactionInput {
  id: string
  onSuccess?: (result: ISubmittableResult) => void
  onSubmitted?: () => void
  onError?: () => void
  toastMessage?: ToastMessage
  isProxy: boolean
}

interface Store {
  transactions?: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: {
      onSuccess?: () => void
      onSubmitted?: () => void
      toast?: ToastMessage
      isProxy?: boolean
    },
  ) => Promise<ISubmittableResult>
  cancelTransaction: (hash: string) => void
}

export const externalWallet = {
  provider: "external",
  name: "External Account",
  proxyName: "Proxy Account",
}

export const PROXY_WALLET_PROVIDER = "polkadot-js"

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

          let externalWalletAddress: string | null = null
          if (import.meta.env.VITE_FF_EXTERNAL_WALLET_ENABLED === "true") {
            // check if there is an external account address within URL
            const search = window.location.href.split("?").pop()
            externalWalletAddress = new URLSearchParams(search).get("account")
          }

          try {
            const { state } = JSON.parse(value)

            // if there is an external account set it as a user wallet account

            if (
              !!externalWalletAddress &&
              safeConvertAddressSS58(externalWalletAddress, 0)
            ) {
              const parsedAccount = JSON.parse(value)

              const externalAccount = {
                name: externalWallet.name,
                address: externalWalletAddress,
                provider: externalWallet.provider,
                isExternalWalletConnected: true,
                delegate: parsedAccount.state.account?.delegate,
              }

              return JSON.stringify({
                ...parsedAccount,
                state: { account: externalAccount },
              })
            }

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
  createTransaction: (transaction, options) => {
    return new Promise<ISubmittableResult>((resolve, reject) => {
      set((store) => {
        return {
          transactions: [
            {
              ...transaction,
              id: uuid(),
              toastMessage: {
                onLoading: options?.toast?.onLoading,
                onSuccess: options?.toast?.onSuccess,
                onError: options?.toast?.onError,
              },
              onSubmitted: () => {
                options?.onSubmitted?.()
              },
              onSuccess: (value) => {
                resolve(value)
                options?.onSuccess?.()
              },
              onError: () => reject(new Error("Transaction rejected")),
              isProxy: !!options?.isProxy,
            },
            ...(store.transactions ?? []),
          ],
        }
      })
    })
  },
  cancelTransaction: (id) => {
    set((store) => ({
      transactions: store.transactions?.filter(
        (transaction) => transaction.id !== id,
      ),
    }))
  },
}))
