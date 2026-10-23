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

// The subscriptions are shared, and unmounting tears all of them down, so
// only the app-wide modal should run this
export const useWalletSubscriptions = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return

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

      for (const type of removedProviders) {
        unsubscribeProvider(type)
      }

      const isConnected = (type: WalletProviderType) =>
        useWeb3Connect.getState().getStatus(type) ===
        WalletProviderStatus.Connected

      for (const type of addedProviders) {
        const wallet = getWallet(type)
        if (!wallet || subscriptions.has(type)) continue

        const subscription: { active: boolean; unsubscribe?: () => void } = {
          active: true,
        }
        subscriptions.set(type, () => {
          subscription.active = false
          subscription.unsubscribe?.()
        })
        subscription.unsubscribe = subscribeWalletAccounts(wallet, {
          onDisconnect: () => {
            if (!subscription.active || !isConnected(type)) return
            unsubscribeProvider(type)
            disconnect(type)
          },
          onAccountsChange: (accounts) => {
            if (!subscription.active || !isConnected(type)) return
            setAccounts(accounts.map(toStoredAccount), type)
          },
          onMainAccountChange: (mainAccount) => {
            if (!subscription.active || !isConnected(type)) return
            setAccount(toStoredAccount(mainAccount))
          },
        })

        // Some extensions emit their first account update while subscribing.
        if (!subscription.active) subscription.unsubscribe()
      }
    })

    return () => {
      unsub()
      subscriptions.forEach((unsubscribe) => unsubscribe())
      subscriptions.clear()
    }
  }, [enabled])
}
