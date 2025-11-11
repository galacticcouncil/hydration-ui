import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  Address,
  useAddressStore,
} from "@/components/address-book/AddressBook.store"
import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { BaseWalletError } from "@/utils/errors"
import { subscribeWalletAccounts, toStoredAccount } from "@/utils/wallet"
import { getWallet } from "@/wallets"

const subscriptions = new Map<WalletProviderType, () => void>()

export const useWeb3Enable = () => {
  const { setStatus, setError, disconnect, setAccounts, setAccount } =
    useWeb3Connect(
      useShallow(
        pick([
          "setStatus",
          "setError",
          "disconnect",
          "setAccounts",
          "setAccount",
        ]),
      ),
    )

  const { add: addToAddressBook } = useAddressStore()

  const unsubAndDisconnect = useCallback(
    (type: WalletProviderType) => {
      const unsub = subscriptions.get(type)
      if (unsub) {
        subscriptions.delete(type)
        unsub()
      }
      disconnect(type)
    },
    [disconnect],
  )

  const { mutateAsync: enable, ...mutation } = useMutation({
    mutationFn: async (type: WalletProviderType) => {
      const wallet = getWallet(type)
      if (!wallet) return []
      await wallet.enable()

      const isSubscribed = subscriptions.has(type)
      if (!isSubscribed) {
        const unsub = subscribeWalletAccounts(wallet, {
          onDisconnect: () => unsubAndDisconnect(type),
          onAccountsChange: (accounts) => {
            setAccounts(accounts.map(toStoredAccount))
          },
          onMainAccountChange: (mainAccount) => {
            setAccount(toStoredAccount(mainAccount))
          },
        })
        subscriptions.set(type, unsub)
      }
      return wallet.getAccounts()
    },
    retry: false,
    onMutate: (type) => setStatus(type, WalletProviderStatus.Pending),
    onSuccess: (data, type) => {
      setAccounts(data.map(toStoredAccount))
      setStatus(type, WalletProviderStatus.Connected)

      const addresses = data
        .map(
          (account): Address => ({
            address: account.address,
            name: account.name,
            provider: account.provider,
            publicKey: safeConvertSS58toPublicKey(account.address),
          }),
        )
        .filter(
          ({ provider }) => provider !== WalletProviderType.ExternalWallet,
        )

      addToAddressBook(addresses)
    },
    onError: (error, type) => {
      setStatus(type, WalletProviderStatus.Error)
      if (error instanceof BaseWalletError) {
        setError(error.message)
      } else {
        console.error(error)
        setError("Unexpected error, please try again.")
      }
    },
  })

  useEffect(() => {
    return () => {
      subscriptions.forEach((unsub) => unsub())
      subscriptions.clear()
    }
  }, [])

  return {
    enable,
    disconnect,
    ...mutation,
  }
}
