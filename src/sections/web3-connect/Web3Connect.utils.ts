import { Wallet, WalletAccount, getWallets } from "@talismn/connect-wallets"
import {
  MutationObserverOptions,
  QueryObserverOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import { POLKADOT_APP_NAME } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  Account,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "./store/useWeb3ConnectStore"

import { MetaMask } from "./wallets/MetaMask/MetaMask"
import { NovaWallet } from "./wallets/NovaWallet"
import { WalletConnect } from "./wallets/WalletConnect/WalletConnect"
import { ExternalWallet } from "./wallets/ExternalWallet"
import { useSearch } from "@tanstack/react-location"
import { safeConvertAddressSS58 } from "utils/formatting"
import { H160, getEvmAddress, isEvmAddress } from "utils/evm"

export enum WalletProviderType {
  MetaMask = "metamask",
  Talisman = "talisman",
  SubwalletJS = "subwallet-js",
  Enkrypt = "enkrypt",
  PolkadotJS = "polkadot-js",
  NovaWallet = "nova-wallet",
  WalletConnect = "walletconnect",
  ExternalWallet = "external",
}

export type WalletProvider = {
  type: WalletProviderType
  wallet: Wallet
}

const EVM_CHAIN_ID = parseInt(import.meta.env.VITE_EVM_CHAIN_ID)

const novaWallet: Wallet = new NovaWallet()

const metaMask: Wallet = new MetaMask({
  onChainChanged(chainId) {
    if (chainId !== EVM_CHAIN_ID) {
      const state = useWeb3ConnectStore.getState()
      state.disconnect()
    }
  },
  onAccountsChanged(accounts, addresses) {
    const state = useWeb3ConnectStore.getState()
    if (!accounts || accounts.length === 0) {
      state.disconnect()
    } else {
      const [account] = accounts
      const [evmAddress] = addresses
      state.setAccount({
        evmAddress,
        address: account.address,
        provider: WalletProviderType.MetaMask,
        name: account.name ?? "",
        isExternalWalletConnected: false,
      })
    }
  },
})

const walletConnect: Wallet = new WalletConnect()

const externalWallet: Wallet = new ExternalWallet()

export const SUPPORTED_WALLET_PROVIDERS: WalletProvider[] = [
  metaMask,
  ...getWallets(),
  novaWallet,
  walletConnect,
  externalWallet,
].map((wallet) => ({
  wallet,
  type: normalizeProviderKey(wallet),
}))

export const useWallet = () => {
  const providerId = useWeb3ConnectStore(
    useCallback((state) => state.provider, []),
  )
  return getWalletProviderByType(providerId)
}

export const useAccount = () => {
  const account = useWeb3ConnectStore(useCallback((state) => state.account, []))
  return { account }
}

export const useProviderAccounts = (
  provider: WalletProviderType | null,
  options?: QueryObserverOptions<WalletAccount[], unknown, Account[]>,
) => {
  const { wallet } = getWalletProviderByType(provider)
  return useQuery<WalletAccount[], unknown, Account[]>(
    ["Web3Connect", ...QUERY_KEYS.providerAccounts(provider ?? "")],
    async () => {
      return (await wallet?.getAccounts()) ?? []
    },
    {
      cacheTime: 0,
      staleTime: 0,
      enabled: !!wallet,
      select: (data) => {
        if (!data) return []

        const acounts = data.map((account) => ({
          address: account.address,
          name: account.name ?? "",
          provider: account.wallet?.extensionName as WalletProviderType,
          isExternalWalletConnected: false,
        }))

        if (wallet instanceof MetaMask) {
          // allow only one account for MetaMask
          const [account] = acounts
          return [
            {
              ...account,
              evmAddress: wallet?.evmAddress ?? "",
            },
          ]
        }

        return acounts
      },
      ...options,
    },
  )
}

export const useWeb3ConnectEagerEnable = () => {
  const { account } = useSearch<{
    Search: {
      account: string
    }
  }>()

  const addressRef = useRef(account)

  useEffect(() => {
    const externalWalletAddress = addressRef.current
    const isPolkadot = !!safeConvertAddressSS58(externalWalletAddress, 0)
    const isEvm = isEvmAddress(externalWalletAddress ?? "")
    const isValidAddress = externalWalletAddress && (isPolkadot || isEvm)

    if (isValidAddress) {
      const { wallet } = getWalletProviderByType(
        WalletProviderType.ExternalWallet,
      )

      const address = isEvm
        ? new H160(getEvmAddress(externalWalletAddress)).toAccount()
        : externalWalletAddress

      if (wallet instanceof ExternalWallet) {
        wallet?.setAddress(address)
      }

      return useWeb3ConnectStore.setState({
        provider: WalletProviderType.ExternalWallet,
        status: WalletProviderStatus.Connected,
        account: {
          name: ExternalWallet.accountName,
          address: address ?? "",
          evmAddress: isEvm ? getEvmAddress(externalWalletAddress) : "",
          provider: WalletProviderType.ExternalWallet,
          isExternalWalletConnected: true,
          delegate: "",
        },
      })
    }
    const initialState = useWeb3ConnectStore.getState()

    const { status, provider, account } = initialState
    const isConnectedOrPending = status === "connected" || status === "pending"

    if (isConnectedOrPending) {
      eagerEnable()
    }

    async function eagerEnable() {
      // skip WalletConnect eager enable
      if (provider === WalletProviderType.WalletConnect) return

      const { wallet } = getWalletProviderByType(provider)
      await wallet?.enable(POLKADOT_APP_NAME)
      const accounts = await wallet?.getAccounts()

      const foundAccount = accounts?.find(
        ({ address }) => address === account?.address,
      )

      // disconnect on account mismatch
      if (!foundAccount) {
        initialState.disconnect()
      }
    }
  }, [])
}

export const useEnableWallet = (
  provider: WalletProviderType | null,
  options?: MutationObserverOptions,
) => {
  const { wallet } = getWalletProviderByType(provider)
  const { mutate: enable, ...mutation } = useMutation(
    ["Web3Connect", ...QUERY_KEYS.walletEnable(provider)],
    async () => wallet?.enable(POLKADOT_APP_NAME),
    {
      retry: false,
      ...options,
    },
  )

  return {
    enable,
    ...mutation,
  }
}

export function normalizeProviderKey(wallet: Wallet): WalletProviderType {
  if (wallet instanceof NovaWallet) {
    return WalletProviderType.NovaWallet
  }

  return wallet.extensionName as WalletProviderType
}

export function getWalletProviderByType(type: WalletProviderType | null) {
  return (
    SUPPORTED_WALLET_PROVIDERS.find((provider) => provider.type === type) ?? {
      wallet: null,
      type: null,
    }
  )
}
