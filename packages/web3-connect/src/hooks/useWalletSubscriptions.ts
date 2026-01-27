import { useEffect } from "react"
import { difference } from "remeda"

import { WalletProviderType } from "@/config/providers"
import {
  useWeb3Connect,
  WalletProviderEntry,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { subscribeWalletAccounts, toStoredAccount } from "@/utils/wallet"
import { getWallet } from "@/wallets"

const subscriptions = new Map<WalletProviderType, () => void>()

const unsubscribeProvider = (type: WalletProviderType) => {
  const unsubscribe = subscriptions.get(type)
  if (!unsubscribe) return

  unsubscribe()
  subscriptions.delete(type)
}

const getConnectedTypes = (providers: WalletProviderEntry[]) =>
  providers
    .filter((p) => p.status === WalletProviderStatus.Connected)
    .map((p) => p.type)

export const useWalletSubscriptions = () => {
  useEffect(() => {
    const unsub = useWeb3Connect.subscribe((state, prevState) => {
      const { providers, setAccounts, setAccount, disconnect } = state
      const { providers: prevProviders } = prevState

      const currentProviderTypes = getConnectedTypes(providers)
      const previousProviderTypes = getConnectedTypes(prevProviders)

      const addedProviders = difference(
        currentProviderTypes,
        previousProviderTypes,
      )

      const removedProviders = difference(
        previousProviderTypes,
        currentProviderTypes,
      )

      for (const type of addedProviders) {
        const wallet = getWallet(type)
        if (!wallet || subscriptions.has(type)) continue

        const unsub = subscribeWalletAccounts(wallet, {
          onDisconnect: () => {
            unsubscribeProvider(type)
            disconnect(type)
          },
          onAccountsChange: (accounts) => {
            setAccounts(accounts.map(toStoredAccount), type)
          },
          onMainAccountChange: (mainAccount) => {
            setAccount(toStoredAccount(mainAccount))
          },
        })

        subscriptions.set(type, unsub)
      }

      for (const type of removedProviders) {
        unsubscribeProvider(type)
      }
    })

    return () => {
      unsub()
      subscriptions.forEach((unsubscribe) => unsubscribe())
      subscriptions.clear()
    }
  }, [])
}
