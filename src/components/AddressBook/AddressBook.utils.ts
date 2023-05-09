import { getWalletBySource } from "@talismn/connect-wallets"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useAccountStore } from "state/store"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useWalletAddresses = () => {
  const { account } = useAccountStore()
  const storageAddresses = useAddressStore()
  const providerAddresses = useProviderAddresses(account?.provider)

  const data = useMemo(() => {
    if (!providerAddresses.data) return []

    let addresses: Address[] = providerAddresses.data.map((pa) => {
      const name = pa.name ?? ""
      const address = pa.address
      const provider = account?.provider ?? "external"
      return { name, address, provider }
    })
    addresses = [...addresses, ...storageAddresses.addresses]

    return addresses
  }, [storageAddresses, providerAddresses])

  return { data, isLoading: providerAddresses.isLoading }
}

export const useProviderAddresses = (provider: string | undefined) => {
  return useQuery(QUERY_KEYS.addresses(provider), async () => {
    const wallet = getWalletBySource(provider)
    return await wallet?.getAccounts()
  })
}

type Address = { name: string; address: string; provider: string }
export type AddressStore = {
  addresses: Address[]
  add: (address: Address) => void
  edit: (address: Address) => void
  remove: (address: string) => void
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
        set((state) => {
          let found = state.addresses.find((a) => a.address === address.address)
          if (!found) return state

          found = { ...found, ...address }
          const rest = state.addresses.filter(
            (a) => a.address !== address.address,
          )

          return { addresses: [...rest, found] }
        }),

      remove: (address) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.address !== address),
        })),
    }),
    { name: "address-book" },
  ),
)
