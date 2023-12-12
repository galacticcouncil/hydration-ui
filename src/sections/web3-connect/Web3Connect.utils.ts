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

import { WalletConnect } from "sections/web3-connect/wallets/WalletConnect"
import { POLKADOT_APP_NAME } from "utils/api"
import { H160, getEvmAddress, isEvmAddress } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  Account,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "./store/useWeb3ConnectStore"
import { WalletProviderType, getSupportedWallets } from "./wallets"
import { ExternalWallet } from "./wallets/ExternalWallet"
import { MetaMask } from "./wallets/MetaMask/MetaMask"
import { requestNetworkSwitch } from "utils/metamask"
export type { WalletProvider } from "./wallets"
export { WalletProviderType, getSupportedWallets }

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

export const useReferrer = () => {
  const referrer = useWeb3ConnectStore(useShallow((state) => state.referrer))
  return { referrer }
}

export const useWalletAccounts = (
  type: WalletProviderType | null,
  options?: QueryObserverOptions<WalletAccount[], unknown, Account[]>,
) => {
  const { wallet } = getWalletProviderByType(type)

  return useQuery<WalletAccount[], unknown, Account[]>(
    ["Web3Connect", ...QUERY_KEYS.providerAccounts(getProviderQueryKey(type))],
    async () => {
      return (await wallet?.getAccounts()) ?? []
    },
    {
      enabled: !!wallet?.extension,
      select: (data) => {
        if (!data) return []

        return data.map(({ address, name, wallet }) => {
          const isEvm = isEvmAddress(address)
          return {
            address: isEvm ? new H160(address).toAccount() : address,
            evmAddress: isEvm ? getEvmAddress(address) : "",
            name: name ?? "",
            provider: wallet?.extensionName as WalletProviderType,
            isExternalWalletConnected: wallet instanceof ExternalWallet,
          }
        })
      },
      ...options,
    },
  )
}

export const useWeb3ConnectEagerEnable = () => {
  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      account: string
      referrer: string
    }
  }>()

  const { wallet } = useWallet()
  const prevWallet = usePrevious(wallet)

  const externalAddressRef = useRef(search?.account)

  useEffect(() => {
    const state = useWeb3ConnectStore.getState()
    if (search?.referrer) {
      state.setReferrer(search.referrer)
    }
  }, [search?.referrer])

  useEffect(() => {
    const state = useWeb3ConnectStore.getState()
    const { status, provider, account: currentAccount } = state

    if (externalAddressRef.current) {
      return setExternalWallet(externalAddressRef.current)
    }

    if (status === "connected" && currentAccount) {
      eagerEnable()
    } else {
      // reset stuck pending requests
      state.disconnect()
    }

    async function eagerEnable() {
      const { wallet } = getWalletProviderByType(provider)
      const isEnabled = !!wallet?.extension

      // skip if already enabled
      if (isEnabled) return

      // skip WalletConnect eager enable
      if (wallet instanceof WalletConnect) return

      // enable proxy wallet for delegate
      if (wallet instanceof ExternalWallet && !!currentAccount?.delegate) {
        await wallet.enableProxy(POLKADOT_APP_NAME)
        return
      }

      await wallet?.enable(POLKADOT_APP_NAME)
      const accounts = await wallet?.getAccounts()

      const foundAccount = accounts?.find((account) => {
        const address = isEvmAddress(account.address)
          ? new H160(account.address).toAccount()
          : account.address

        return address === currentAccount?.address
      })

      // disconnect on account mismatch
      if (!foundAccount) {
        state.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const hasWalletDisconnected = !wallet && !!prevWallet

    // look for disconnect to clean up
    if (hasWalletDisconnected) {
      cleanUp()
    }

    function cleanUp() {
      const metamask = prevWallet instanceof MetaMask ? prevWallet : null
      const external = prevWallet instanceof ExternalWallet ? prevWallet : null

      if (metamask) {
        // unsub from metamask events on disconnect
        metamask.unsubscribe()
      }

      if (external) {
        // reset external wallet on disconnect
        external.setAddress(undefined)
        navigate({ search: { account: undefined } })
      }
    }
  }, [navigate, prevWallet, wallet])
}

export const useEnableWallet = (
  provider: WalletProviderType | null,
  options?: MutationObserverOptions,
) => {
  const { wallet } = getWalletProviderByType(provider)
  const { mutate: enable, ...mutation } = useMutation(
    async () => {
      await wallet?.enable(POLKADOT_APP_NAME)

      if (wallet instanceof MetaMask && wallet.extension) {
        await requestNetworkSwitch(wallet.extension)
      }
    },
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

export function setExternalWallet(externalAddress = "") {
  const state = useWeb3ConnectStore.getState()

  const { wallet } = getWalletProviderByType(WalletProviderType.ExternalWallet)
  const externalWallet = wallet instanceof ExternalWallet ? wallet : null

  if (!externalWallet) return

  // reuse same account from store if addresses match
  if (state.account?.address === externalAddress) {
    externalWallet.setAddress(externalAddress)
    return
  }

  const isHydra = !!safeConvertAddressSS58(externalAddress, 0)
  const isEvm = isEvmAddress(externalAddress ?? "")
  const isValidAddress = externalAddress && (isHydra || isEvm)

  if (isValidAddress) {
    const address = isEvm
      ? new H160(getEvmAddress(externalAddress)).toAccount()
      : externalAddress

    externalWallet.setAddress(address)
    return useWeb3ConnectStore.setState({
      provider: WalletProviderType.ExternalWallet,
      status: WalletProviderStatus.Connected,
      account: {
        name: externalWallet.accountName,
        address: address ?? "",
        evmAddress: isEvm ? getEvmAddress(externalAddress) : "",
        provider: WalletProviderType.ExternalWallet,
        isExternalWalletConnected: true,
        delegate: "",
      },
    })
  }
}

export function getWalletProviderByType(type?: WalletProviderType | null) {
  return (
    getSupportedWallets().find((provider) => provider.type === type) ?? {
      wallet: null,
      type: null,
    }
  )
}

function getProviderQueryKey(type: WalletProviderType | null) {
  const { wallet } = getWalletProviderByType(type)

  if (wallet instanceof MetaMask) {
    return [type, wallet.signer?.address].join("-")
  }

  if (wallet instanceof ExternalWallet) {
    return [type, wallet.account?.address].join("-")
  }

  return type ?? ""
}
