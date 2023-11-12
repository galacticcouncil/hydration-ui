import { WalletAccount } from "@talismn/connect-wallets"
import { useNavigate, useSearch } from "@tanstack/react-location"
import {
  MutationObserverOptions,
  QueryObserverOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { useShallow } from "hooks/useShallow"
import { useEffect, useRef } from "react"
import { usePrevious } from "react-use"
import {
  SUPPORTED_WALLET_PROVIDERS,
  WalletProviderType,
} from "sections/web3-connect/wallets"
import { POLKADOT_APP_NAME } from "utils/api"
import { H160, getEvmAddress, isEvmAddress } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  Account,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "./store/useWeb3ConnectStore"
import { ExternalWallet } from "./wallets/ExternalWallet"
import { MetaMask } from "./wallets/MetaMask/MetaMask"
export { WalletProviderType } from "./wallets"
export type { WalletProvider } from "./wallets"

export const useWallet = () => {
  const providerType = useWeb3ConnectStore(
    useShallow((state) => state.provider),
  )

  return getWalletProviderByType(providerType)
}

export const useAccount = () => {
  const account = useWeb3ConnectStore(useShallow((state) => state.account))
  return { account }
}

export const useWalletAccounts = (
  provider: WalletProviderType | null,
  options?: QueryObserverOptions<WalletAccount[], unknown, Account[]>,
) => {
  const { wallet } = getWalletProviderByType(provider)

  const providerKey =
    wallet instanceof MetaMask ? `${provider}-${wallet.evmAddress}` : provider

  return useQuery<WalletAccount[], unknown, Account[]>(
    ["Web3Connect", ...QUERY_KEYS.providerAccounts(providerKey ?? "")],
    async () => {
      return (await wallet?.getAccounts()) ?? []
    },
    {
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
  const navigate = useNavigate()
  const { account } = useSearch<{
    Search: {
      account: string
    }
  }>()

  const { wallet } = useWallet()
  const prevWallet = usePrevious(wallet)

  const addressRef = useRef(account)

  useEffect(() => {
    setExternalWallet(addressRef.current)

    const state = useWeb3ConnectStore.getState()
    const { status, provider, account } = state

    if (status === "connected") {
      eagerEnable()
    } else {
      // reset stuck pending requests
      state.disconnect()
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
        state.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const hasWalletDisconnected = !wallet && !!prevWallet
    if (!hasWalletDisconnected) return

    const metamask = prevWallet instanceof MetaMask ? prevWallet : null
    const external = prevWallet instanceof ExternalWallet ? prevWallet : null

    if (metamask) {
      // unsub from metamask events
      metamask.unsubscribe()
    }

    if (external) {
      // reset external wallet
      external.setAddress(undefined)
      navigate({ search: { account: undefined } })
    }
  }, [navigate, prevWallet, wallet])
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

export function setExternalWallet(externalAddress: string = "") {
  const isPolkadot = !!safeConvertAddressSS58(externalAddress, 0)
  const isEvm = isEvmAddress(externalAddress ?? "")
  const isValidAddress = externalAddress && (isPolkadot || isEvm)
  if (isValidAddress) {
    const { wallet } = getWalletProviderByType(
      WalletProviderType.ExternalWallet,
    )

    const address = isEvm
      ? new H160(getEvmAddress(externalAddress)).toAccount()
      : externalAddress

    if (wallet instanceof ExternalWallet) {
      wallet?.setAddress(address)
    }

    return useWeb3ConnectStore.setState({
      provider: WalletProviderType.ExternalWallet,
      status: WalletProviderStatus.Connected,
      account: {
        name: ExternalWallet.accountName,
        address: address ?? "",
        evmAddress: isEvm ? getEvmAddress(externalAddress) : "",
        provider: WalletProviderType.ExternalWallet,
        isExternalWalletConnected: true,
        delegate: "",
      },
    })
  }
}

export function getWalletProviderByType(type: WalletProviderType | null) {
  return (
    SUPPORTED_WALLET_PROVIDERS.find((provider) => provider.type === type) ?? {
      wallet: null,
      type: null,
    }
  )
}

export function getSupportedWallets() {
  return SUPPORTED_WALLET_PROVIDERS
}
