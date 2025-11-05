import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
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

  const unsubsRef = useRef<Map<WalletProviderType, () => void>>(new Map())

  const { mutateAsync: enable, ...mutation } = useMutation({
    mutationFn: async (type: WalletProviderType) => {
      const wallet = getWallet(type)
      if (!wallet) return []
      await wallet.enable()

      const isSubscribed = unsubsRef.current.has(type)
      if (!isSubscribed) {
        const unsub = subscribeWalletAccounts(wallet, {
          onDisconnect: () => disconnect(type),
          onAccountsChange: (accounts) => {
            setAccounts(accounts.map(toStoredAccount))
          },
          onMainAccountChange: (mainAccount) => {
            setAccount(toStoredAccount(mainAccount))
          },
        })
        unsubsRef.current.set(type, unsub)
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
    const unsubs = unsubsRef.current
    return () => {
      unsubs.forEach((unsub) => unsub())
      unsubs.clear()
    }
  }, [])

  return {
    enable,
    disconnect,
    ...mutation,
  }
}
