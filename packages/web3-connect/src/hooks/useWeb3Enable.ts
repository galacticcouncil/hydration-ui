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
import {
  AuthError,
  BaseWalletError,
  StaleAttemptError,
  UserRejectedError,
} from "@/utils/errors"
import { toStoredAccount } from "@/utils/wallet"
import { getConflictingWalletProviders } from "@/utils/walletSource"
import { getWallet, getWallets } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

type UseWeb3EnableOptions = {
  disconnectOnError?: boolean
  restore?: boolean
  eager?: boolean
}

type EnableRequest = { type: WalletProviderType; attempt: number }

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

const disconnectUnusedWallet = (type: WalletProviderType) => {
  const status = useWeb3Connect.getState().getStatus(type)
  if (
    status !== WalletProviderStatus.Connected &&
    status !== WalletProviderStatus.Pending
  )
    getWallet(type)?.disconnect()
}

const assertCurrentRequest = ({ type, attempt }: EnableRequest) => {
  if (
    isCurrentAttempt(type, attempt) &&
    useWeb3Connect.getState().getStatus(type) !==
      WalletProviderStatus.Disconnected
  )
    return
  disconnectUnusedWallet(type)
  const wallet = getWallet(type)
  if (wallet) throw new StaleAttemptError(wallet)
  throw new Error("Wallet connection attempt was superseded.")
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
    connectProvider,
    cancelPendingProvider,
    setRestoreState,
    clearRestoreState,
    markRecent,
  } = useWeb3Connect(
    useShallow(
      pick([
        "setStatus",
        "getStatus",
        "setError",
        "disconnect",
        "setAccounts",
        "connectProvider",
        "cancelPendingProvider",
        "setRestoreState",
        "clearRestoreState",
        "markRecent",
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
      if (provider) disconnectUnusedWallet(provider)
      else
        getWallets().forEach((wallet) =>
          disconnectUnusedWallet(wallet.provider),
        )
    },
    [disconnectProvider],
  )

  const { mutateAsync, ...mutation } = useMutation({
    mutationFn: async (request: EnableRequest) => {
      const { type } = request
      assertCurrentRequest(request)
      const wallet = getWallet(type)
      if (!wallet) return []
      // A restore must bring back a stored session, never open the wallet
      if (options.restore && wallet.restore) {
        await wallet.restore()
      } else {
        await wallet.enable()
      }
      assertCurrentRequest(request)
      const accounts = await wallet.getAccounts()
      assertCurrentRequest(request)
      if (!accounts.length) throw new AuthError(wallet)
      return accounts
    },
    retry: false,
    onMutate: ({ type, attempt }) => {
      if (!isCurrentAttempt(type, attempt)) return
      if (options.restore) {
        setRestoreState(type, WalletRestoreState.Restoring)
      } else {
        clearRestoreState(type)
        setStatus(type, WalletProviderStatus.Pending)
      }
    },
    onSuccess: (data, request) => {
      assertCurrentRequest(request)
      const { type } = request

      if (options.restore) {
        setAccounts(data.map(toStoredAccount), type)
        setStatus(type, WalletProviderStatus.Connected)
      } else {
        const conflicts = getConflictingWalletProviders(getWallets(), type)
        conflicts.forEach(abandonEnable)
        connectProvider(data.map(toStoredAccount), type)
        conflicts.forEach(disconnectUnusedWallet)
      }
      if (!options.eager) markRecent(type)

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
    onError: (error, { type, attempt }) => {
      if (
        !isCurrentAttempt(type, attempt) ||
        error instanceof StaleAttemptError
      ) {
        disconnectUnusedWallet(type)
        return
      }

      if (options.restore) {
        if (isTimeoutError(error)) {
          return setRestoreState(type, WalletRestoreState.Unavailable)
        }
        disconnectProvider(type)
        disconnectUnusedWallet(type)
        return
      }

      if (options.disconnectOnError || error instanceof UserRejectedError) {
        disconnectProvider(type)
        disconnectUnusedWallet(type)
        return
      }

      setStatus(type, WalletProviderStatus.Error)
      const errorMessage =
        error instanceof BaseWalletError
          ? error.message
          : error instanceof Error && error.message
            ? error.message
            : "Unexpected error, please try again."
      setError(errorMessage)
      disconnectUnusedWallet(type)
    },
  })

  const enable = useCallback(
    async (type: WalletProviderType) => {
      const request = { type, attempt: nextAttempt(type) }
      if (!options.restore) {
        for (const sibling of getConflictingWalletProviders(
          getWallets(),
          type,
        )) {
          if (getStatus(sibling) === WalletProviderStatus.Connected) continue
          abandonEnable(sibling)
          cancelPendingProvider(sibling)
          disconnectUnusedWallet(sibling)
        }
      }
      const accounts = await mutateAsync(request)
      assertCurrentRequest(request)
      return accounts
    },
    [mutateAsync, options.restore, getStatus, cancelPendingProvider],
  )

  return {
    enable,
    disconnect,
    ...mutation,
  }
}
