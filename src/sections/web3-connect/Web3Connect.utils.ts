import { useNavigate, useSearch } from "@tanstack/react-location"
import {
  MutationObserverOptions,
  QueryObserverOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { useShallow } from "hooks/useShallow"
import { useEffect, useMemo, useRef } from "react"
import { usePrevious } from "react-use"

import {
  NamespaceType,
  WalletConnect,
} from "sections/web3-connect/wallets/WalletConnect"
import { POLKADOT_APP_NAME } from "utils/api"
import { H160, getEvmAddress, isEvmAddress } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  Account,
  WalletMode,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "./store/useWeb3ConnectStore"
import {
  getSupportedWallets,
  handleAnnounceProvider,
  WalletProvider,
} from "./wallets"
import { ExternalWallet } from "./wallets/ExternalWallet"
import { MetaMask } from "./wallets/MetaMask"
import {
  isMetaMask,
  isMetaMaskLike,
  requestNetworkSwitch,
} from "utils/metamask"
import { genesisHashToChain } from "utils/helpers"
import {
  EIP6963AnnounceProviderEvent,
  WalletAccount,
} from "sections/web3-connect/types"
import {
  EVM_PROVIDERS,
  WalletProviderType,
} from "sections/web3-connect/constants/providers"
import { useAddressStore } from "components/AddressBook/AddressBook.utils"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { PolkadotSigner } from "sections/web3-connect/signer/PolkadotSigner"
export type { WalletProvider } from "./wallets"
export { WalletProviderType, getSupportedWallets }

export const useWallet = () => {
  const providerType = useWeb3ConnectStore(
    useShallow((state) => state.account?.provider),
  )
  return useMemo(() => getWalletProviderByType(providerType), [providerType])
}

export const useAccount = () => {
  const account = useWeb3ConnectStore(useShallow((state) => state.account))
  return { account }
}

export const useEvmAccount = () => {
  const { account } = useAccount()
  const { wallet } = useWallet()

  const address = account?.displayAddress ?? ""

  const evm = useQuery(
    QUERY_KEYS.evmChainInfo(address),
    async () => {
      const chainId =
        isMetaMask(wallet?.extension) || isMetaMaskLike(wallet?.extension)
          ? await wallet?.extension?.request({ method: "eth_chainId" })
          : null

      return {
        chainId: Number(chainId),
      }
    },
    {
      enabled: !!address,
    },
  )

  if (!address) {
    return {
      account: null,
    }
  }

  return {
    account: {
      ...evm.data,
      name: account?.name ?? "",
      address: account?.displayAddress,
    },
  }
}

export const useConnectedProviders = () => {
  const { providers, mode, getActiveProviders } = useWeb3ConnectStore()
  const activeProviders =
    mode !== WalletMode.Default ? getActiveProviders() : providers
  return useMemo(() => {
    return activeProviders
      .map(({ type }) => getWalletProviderByType(type))
      .filter(({ wallet }) => !!wallet?.extension) as WalletProvider[]
  }, [activeProviders])
}

export const useConnectedProvider = (type: WalletProviderType | null) => {
  const connectedProviders = useConnectedProviders()

  return useMemo(
    () =>
      connectedProviders.find((p) => p.type === type) ?? {
        wallet: null,
        type: null,
      },
    [connectedProviders, type],
  )
}

export const useWalletAccounts = (
  type?: WalletProviderType | null,
  options?: QueryObserverOptions<WalletAccount[], unknown, Account[]>,
) => {
  const connectedProviders = useConnectedProviders()

  return useQuery<WalletAccount[], unknown, Account[]>(
    QUERY_KEYS.providerAccounts(
      connectedProviders.map(({ type }) => getProviderQueryKey(type)).join("-"),
    ),
    async () => {
      const accounts = (
        await Promise.all(
          connectedProviders.map(async ({ wallet }) =>
            wallet ? await wallet.getAccounts() : [],
          ),
        )
      ).flat()
      return accounts
    },
    {
      enabled: connectedProviders.length > 0,
      select: (data) => {
        if (!data) return []
        if (type) {
          return data
            .map(mapWalletAccount)
            .filter(({ provider }) => provider === type)
        }
        return data.map(mapWalletAccount)
      },
      ...options,
    },
  )
}

export const useAnnounceProviders = () => {
  useEffect(() => {
    const announceProvider = (e: unknown) =>
      handleAnnounceProvider(e as EIP6963AnnounceProviderEvent)

    window.addEventListener("eip6963:announceProvider", announceProvider)
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    return () => {
      window.removeEventListener("eip6963:announceProvider", announceProvider)
    }
  }, [])
}

export const useWeb3ConnectEagerEnable = () => {
  useAnnounceProviders()

  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      account: string
    }
  }>()

  const providers = useConnectedProviders()
  const prevProviders = usePrevious(providers)

  const externalAddressRef = useRef(search?.account)

  useEffect(() => {
    const state = useWeb3ConnectStore.getState()
    const { providers, account: currentAccount } = state

    if (
      externalAddressRef.current &&
      externalAddressRef.current !== currentAccount?.address
    ) {
      // override wallet from search param
      return setExternalWallet(externalAddressRef.current)
    }

    if (providers.length > 0) {
      providers.forEach((p) => {
        const { wallet } = getWalletProviderByType(p.type)
        if (wallet) {
          eagerEnable(wallet)
        }
      })
    } else {
      state.disconnect()
    }

    async function eagerEnable(wallet: WalletProvider["wallet"]) {
      if (wallet instanceof ExternalWallet) {
        if (currentAccount?.provider === WalletProviderType.ExternalWallet) {
          await wallet.setAddress(currentAccount.address)
          if (currentAccount?.delegate) {
            // enable proxy wallet for delegate
            await wallet.enableProxy(POLKADOT_APP_NAME)
          }
        } else {
          state.disconnect(WalletProviderType.ExternalWallet)
        }

        return
      }

      const isEnabled = !!wallet?.extension

      // skip if already enabled
      if (isEnabled) return

      // disconnect on missing WalletConnect session
      if (wallet instanceof WalletConnect && !wallet._session) {
        wallet.disconnect()
        state.disconnect()
        return
      }

      await wallet?.enable(POLKADOT_APP_NAME)
    }
  }, [])

  useEffect(() => {
    prevProviders?.forEach(({ wallet, type }) => {
      const hasWalletDisconnected = !providers.find((p) => p.type === type)
      if (wallet && hasWalletDisconnected) {
        cleanUp(wallet)
      }
    })

    function cleanUp(wallet: WalletProvider["wallet"]) {
      if (wallet instanceof WalletConnect) {
        // disconnect from WalletConnect
        wallet.disconnect()
      }

      if (wallet instanceof MetaMask) {
        // unsub from metamask events on disconnect
        wallet.unsubscribe()
      }

      if (wallet instanceof ExternalWallet) {
        // reset external wallet on disconnect
        wallet.setAddress(undefined)
        navigate({ search: { account: undefined } })
      }
    }
  }, [navigate, prevProviders, providers])
}

export const useEnableWallet = (
  provider: WalletProviderType | null,
  options?: MutationObserverOptions<
    WalletAccount[] | undefined,
    unknown,
    NamespaceType | void,
    unknown
  >,
) => {
  const { wallet } = getWalletProviderByType(provider)
  const { add: addToAddressBook } = useAddressStore()
  const meta = useWeb3ConnectStore(useShallow((state) => state.meta))
  const { mutate: enable, ...mutation } = useMutation<
    WalletAccount[] | undefined,
    unknown,
    NamespaceType | void,
    unknown
  >(
    async (namespace) => {
      if (wallet instanceof WalletConnect && namespace) {
        wallet.setNamespace(namespace)
      }

      await wallet?.enable(POLKADOT_APP_NAME)

      if (wallet instanceof MetaMask) {
        await requestNetworkSwitch(wallet.extension, {
          chain: meta?.chain,
        })
      }

      return wallet?.getAccounts()
    },
    {
      retry: false,
      ...options,
      onSuccess: (...args) => {
        const [data] = args
        if (data?.length) {
          const addresses = data
            .map((account) => {
              const { displayAddress, name, provider } =
                mapWalletAccount(account)
              return {
                address: displayAddress,
                name,
                provider,
              }
            })
            .filter(
              ({ provider }) => provider !== WalletProviderType.ExternalWallet,
            )
          addToAddressBook(addresses)
        }
        options?.onSuccess?.(...args)
      },
    },
  )

  return {
    enable,
    ...mutation,
  }
}

export const useEvmWalletReadiness = () => {
  const { wallet } = useWallet()
  const { account } = useEvmAccount()
  const address = account?.address ?? ""

  const isEvmExtension =
    isMetaMask(wallet?.extension) || isMetaMaskLike(wallet?.extension)

  return useQuery(
    QUERY_KEYS.evmWalletReadiness(address),
    async () => {
      const getIsReady = async () => {
        const balance = isEvmExtension
          ? await wallet?.extension?.request({
              method: "eth_getBalance",
              params: [address, "latest"],
            })
          : null

        return !!balance
      }

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(false)
        }, 2500)

        getIsReady()
          .then((response) => {
            clearTimeout(timer)
            resolve(response)
          })
          .catch(() => {
            clearTimeout(timer)
            resolve(false)
          })
      })
    },
    {
      enabled: isEvmExtension && !!address,
      cacheTime: 0,
      staleTime: 0,
      initialData: true,
      refetchInterval: 5000,
    },
  )
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
      providers: [
        {
          type: WalletProviderType.ExternalWallet,
          status: WalletProviderStatus.Connected,
        },
      ],
      account: {
        name: externalWallet.accountName,
        address: address ?? "",
        displayAddress: isEvm
          ? getEvmAddress(externalAddress)
          : externalAddress,
        provider: WalletProviderType.ExternalWallet,
        isExternalWalletConnected: true,
        delegate: "",
      },
    })
  }
}

export function isEvmProvider(provider?: WalletProviderType | null) {
  if (!provider) return false
  return EVM_PROVIDERS.includes(provider)
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

  if (wallet?.signer instanceof PolkadotSigner) {
    return [type, wallet.signer?.session?.topic].filter(Boolean).join("-")
  }

  if (wallet?.signer instanceof EthereumSigner) {
    return [type, wallet.signer?.address].filter(Boolean).join("-")
  }

  if (wallet instanceof ExternalWallet) {
    return [type, wallet.account?.address].filter(Boolean).join("-")
  }

  return type ?? ""
}

function mapWalletAccount({
  address,
  name,
  wallet,
  genesisHash,
}: WalletAccount) {
  const isEvm = isEvmAddress(address)

  const chainInfo = genesisHashToChain(genesisHash)

  return {
    address: isEvm ? new H160(address).toAccount() : address,
    displayAddress: isEvm
      ? address
      : safeConvertAddressSS58(address, chainInfo.prefix) || address,
    genesisHash,
    name: name ?? "",
    provider: wallet?.extensionName as WalletProviderType,
    isExternalWalletConnected: wallet instanceof ExternalWallet,
  }
}
