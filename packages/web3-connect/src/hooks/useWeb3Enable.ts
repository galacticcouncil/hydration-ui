import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  AddressInput,
  useAddressStore,
} from "@/components/address-book/AddressBook.store"
import { NEAR_PROVIDERS, WalletProviderType } from "@/config/providers"
import {
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
  WalletRestoreState,
} from "@/hooks/useWeb3Connect"
import { BaseWalletError, UserRejectedError } from "@/utils/errors"
import { toStoredAccount } from "@/utils/wallet"
import { getWallet } from "@/wallets"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

type UseWeb3EnableOptions = {
  disconnectOnError?: boolean
  restore?: boolean
}

const ADDRESS_BOOK_PROVIDER_BLACKLIST = [
  WalletProviderType.ExternalWallet,
  WalletProviderType.WalletConnect,
]

// Mutation callbacks fire even for abandoned attempts, so each provider's
// latest attempt is tracked here and late results from older ones are ignored.
const enableAttempts = new Map<WalletProviderType, number>()

const isCurrentAttempt = (type: WalletProviderType, attempt?: number) =>
  attempt !== undefined && enableAttempts.get(type) === attempt

const nextAttempt = (type: WalletProviderType) => {
  const attempt = (enableAttempts.get(type) ?? 0) + 1
  enableAttempts.set(type, attempt)
  return attempt
}

/** Makes any in-flight enable of `type` stale, so its late result is ignored. */
export const abandonEnable = (type: WalletProviderType) => {
  nextAttempt(type)
}

const isTimeoutError = (error: unknown) =>
  error instanceof Error && error.name === "TimeoutError"

export const useWeb3Enable = (options: UseWeb3EnableOptions = {}) => {
  const {
    setStatus,
    getStatus,
    setError,
    disconnect: disconnectProvider,
    setAccounts,
    setRestoreState,
    clearRestoreState,
  } = useWeb3Connect(
    useShallow(
      pick([
        "setStatus",
        "getStatus",
        "setError",
        "disconnect",
        "setAccounts",
        "setRestoreState",
        "clearRestoreState",
      ]),
    ),
  )

  const { add: addToAddressBook } = useAddressStore()

  const disconnect = useCallback(
    (provider?: WalletProviderType) => {
      if (provider) {
        abandonEnable(provider)
      } else {
        Object.values(WalletProviderType).forEach(abandonEnable)
      }
      disconnectProvider(provider)
    },
    [disconnectProvider],
  )

  const { mutateAsync: enable, ...mutation } = useMutation({
    mutationFn: async (type: WalletProviderType) => {
      const wallet = getWallet(type)
      if (!wallet) return []
      // A restore must bring back a NEAR session, never open the wallet
      if (options.restore && wallet instanceof BaseNearWallet) {
        await wallet.restore()
      } else {
        await wallet.enable()
      }
      return wallet.getAccounts()
    },
    retry: false,
    onMutate: (type) => {
      const attempt = nextAttempt(type)
      if (options.restore) {
        setRestoreState(type, WalletRestoreState.Restoring)
      } else {
        clearRestoreState(type)
        setStatus(type, WalletProviderStatus.Pending)
      }
      return attempt
    },
    onSuccess: (data, type, attempt) => {
      if (!isCurrentAttempt(type, attempt)) return
      if (getStatus(type) === WalletProviderStatus.Disconnected) return

      setAccounts(data.map(toStoredAccount), type)
      setStatus(type, WalletProviderStatus.Connected)

      if (options.restore) {
        clearRestoreState(type)
        const wallet = getWallet(type)
        const { account } = useWeb3Connect.getState()
        if (wallet instanceof BaseSubstrateWallet && account) {
          const signerAddress = account.isMultisig
            ? (account.multisigSignerAddress ?? account.address)
            : account.address
          wallet.setSigner(signerAddress)
        }
      }

      const addresses = data
        .map(
          (account): AddressInput => ({
            address: account.address,
            name: account.name,
            provider: account.provider,
            // NEAR ids can be 0x… (NEP-518), which would be inferred as EVM
            ...(NEAR_PROVIDERS.includes(account.provider) && {
              mode: WalletMode.Near,
            }),
          }),
        )
        .filter(
          ({ provider }) =>
            provider !== undefined &&
            !ADDRESS_BOOK_PROVIDER_BLACKLIST.includes(provider),
        )

      addToAddressBook(addresses)
    },
    onError: (error, type, attempt) => {
      if (!isCurrentAttempt(type, attempt)) return

      if (options.restore) {
        if (isTimeoutError(error)) {
          return setRestoreState(type, WalletRestoreState.Unavailable)
        }
        return disconnectProvider(type)
      }

      if (options.disconnectOnError || error instanceof UserRejectedError) {
        return disconnectProvider(type)
      }

      setStatus(type, WalletProviderStatus.Error)
      if (error instanceof BaseWalletError) {
        setError(error.message)
      } else {
        setError("Unexpected error, please try again.")
      }
    },
  })

  return {
    enable,
    disconnect,
    ...mutation,
  }
}
