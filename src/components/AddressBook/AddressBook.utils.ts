import { getWalletBySource } from "@talismn/connect-wallets"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  useAccount,
  useWalletAccounts,
} from "sections/web3-connect/Web3Connect.utils"
import { shortenAccountAddress } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useWalletAddresses = () => {
  const { account } = useAccount()
  const storageAddresses = useAddressStore()
  const providerAddresses = useWalletAccounts(account?.provider ?? null)

  const data = useMemo(() => {
    if (!providerAddresses.data) return []

    let addresses: Address[] = providerAddresses.data.map((pa) => {
      const name = pa.evmAddress
        ? shortenAccountAddress(pa.evmAddress)
        : pa.name ?? ""
      const address = pa.address
      const provider = account?.provider ?? "external"
      return { name, address, provider }
    })
    addresses = [...addresses, ...storageAddresses.addresses]

    return addresses
  }, [providerAddresses.data, storageAddresses.addresses, account?.provider])

  return { data, isLoading: providerAddresses.isLoading }
}

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
  provider: string
}
export type AddressStore = {
  addresses: Address[]
  add: (address: Address) => void
  edit: (address: Address) => void
  remove: (id: string) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addresses: [],

      add: (address) =>
        set((state) => ({
          addresses: [
            ...state.addresses,
            { ...address, id: crypto.randomUUID() },
          ],
        })),

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
