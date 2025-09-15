import { addr } from "@galacticcouncil/xcm-core"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useQuery } from "@tanstack/react-query"
import {
  PROVIDERS_BY_WALLET_MODE,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { safeConvertAddressH160 } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import { diffBy } from "utils/rx"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const { Ss58Addr, EvmAddr, SolanaAddr, SuiAddr } = addr

export const useProviderAccounts = (
  provider: string | undefined,
  enabled?: boolean,
) => {
  return useQuery(
    QUERY_KEYS.providerAccounts(provider),
    async () => {
      const wallet = getWalletBySource(provider)
      return await wallet?.getAccounts()
    },
    { enabled },
  )
}

export function validateAddress(address: string) {
  switch (true) {
    case EvmAddr.isValid(address):
      return WalletMode.EVM
    case Ss58Addr.isValid(address):
      return WalletMode.Substrate
    case SolanaAddr.isValid(address):
      return WalletMode.Solana
    case SuiAddr.isValid(address):
      return WalletMode.Sui
    default:
      return null
  }
}

export type Address = {
  id?: string
  name: string
  address: string
  provider: WalletProviderType
  isCustom?: boolean
}
export type AddressStore = {
  addresses: Address[]
  add: (address: Address | Address[]) => void
  edit: (address: Address) => void
  remove: (id: string) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addresses: [],

      add: (address) =>
        set((state) => {
          const addresses = Array.isArray(address) ? address : [address]

          const uniqueAddresses = diffBy(
            ({ address }) =>
              safeConvertAddressH160(address) ||
              safeConvertAddressSS58(address, 0) ||
              address,
            addresses,
            state.addresses,
          )

          if (!uniqueAddresses.length) return { addresses: state.addresses }

          return {
            addresses: [
              ...state.addresses,
              ...uniqueAddresses.map((address) => ({
                ...address,
                id: crypto.randomUUID(),
              })),
            ],
          }
        }),

      edit: (address) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === address.id ? { ...a, ...address } : a,
          ),
        })),

      remove: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),
    }),
    {
      name: "address-book",
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as AddressStore

        const { addresses } = state

        try {
          return {
            ...state,
            addresses: addresses.map((address) => {
              if (address.provider === WalletProviderType.ExternalWallet) {
                const addressMode = validateAddress(address.address)

                if (!addressMode) return address

                const provider = PROVIDERS_BY_WALLET_MODE[addressMode][0]

                return { ...address, provider, isCustom: true }
              }

              if (!address.isCustom) {
                const newAddressFormat =
                  safeConvertAddressSS58(address.address, 0) || address.address
                return {
                  ...address,
                  address: newAddressFormat,
                }
              }

              return address
            }),
          }
        } catch (error) {
          return state
        }
      },
    },
  ),
)

export const getBlacklistedWallets = (mode: WalletMode) => {
  const allWalletModes = Object.values(WalletMode)
  const allowed =
    mode === WalletMode.SubstrateEVM
      ? [WalletMode.EVM, WalletMode.Substrate, WalletMode.Default]
      : mode

  return allWalletModes.filter((value) => !allowed.includes(value))
}
