import { addr } from "@galacticcouncil/xcm-core"
import { PublicKey } from "@solana/web3.js"
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

function isSolanaAddress(address: string) {
  const pubkey = new PublicKey(address)
  return PublicKey.isOnCurve(pubkey.toBuffer())
}

export function validateAddress(address: string) {
  if (addr.isH160(address)) {
    return WalletMode.EVM
  } else if (addr.isSs58(address)) {
    return WalletMode.Substrate
  } else if (addr.isSolana(address)) {
    try {
      if (isSolanaAddress(address)) {
        return WalletMode.Solana
      }
    } catch (error) {
      return null
    }
  }

  return null
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
      version: 1,
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
  if (mode === WalletMode.Solana) {
    return Object.values(WalletMode).filter(
      (value) => value !== WalletMode.Solana,
    )
  }

  if (mode === WalletMode.EVM) {
    return Object.values(WalletMode).filter((value) => value !== WalletMode.EVM)
  }

  if (mode === WalletMode.SubstrateEVM) {
    return Object.values(WalletMode).filter(
      (value) =>
        value !== WalletMode.EVM &&
        value !== WalletMode.Substrate &&
        value !== WalletMode.Default,
    )
  }

  if (mode === WalletMode.Substrate) {
    return Object.values(WalletMode).filter(
      (value) => value !== WalletMode.Substrate,
    )
  }
}
