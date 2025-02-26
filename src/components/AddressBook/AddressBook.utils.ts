import { getWalletBySource } from "@talismn/connect-wallets"
import { useQuery } from "@tanstack/react-query"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"
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

export type Address = {
  id?: string
  name: string
  address: string
  provider: WalletProviderType
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
              "",
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
    { name: "address-book" },
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
