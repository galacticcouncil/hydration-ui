import {
  createZustandStorage,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { z } from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { isWalletProviderType, WalletProviderType } from "@/config/providers"

const addressSchemaV2 = z.object({
  id: z.string().optional(),
  name: z.string(),
  address: z.string(),
  provider: z.string(),
  isCustom: z.boolean().optional(),
})

const stateSchemaV2 = z.object({
  addresses: z.array(addressSchemaV2),
})

const addressSchema = z.object({
  publicKey: z.string(),
  name: z.string(),
  address: z.string(),
  provider: z.enum(WalletProviderType),
  isCustom: z.boolean().optional(),
})

export type Address = z.infer<typeof addressSchema>

const stateSchema = z.object({
  addresses: z.array(addressSchema),
})

type State = z.infer<typeof stateSchema>

const defaultState: State = {
  addresses: [],
}

const version = 3

export type AddressStore = State & {
  readonly add: (address: Address | Address[]) => void
  readonly edit: (address: Address) => void
  readonly remove: (publicKey: string) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      ...defaultState,

      add: (address) =>
        set((state) => {
          const addresses = Array.isArray(address) ? address : [address]
          const addressesSet = new Set(state.addresses.map((a) => a.publicKey))
          const uniqueAddresses = addresses.filter(
            (a) => !addressesSet.has(a.publicKey),
          )

          if (!uniqueAddresses.length) {
            return { addresses: state.addresses }
          }

          return {
            addresses: state.addresses.concat(uniqueAddresses),
          }
        }),

      edit: (address) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.publicKey === address.publicKey ? address : a,
          ),
        })),

      remove: (publicKey) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.publicKey !== publicKey),
        })),
    }),
    {
      name: "address-book",
      version,
      storage: createZustandStorage(version, stateSchema, defaultState, {
        previousStateSchema: stateSchemaV2,
        migrate: (previousState) => ({
          addresses: previousState.addresses
            .map<Address | null>((address) => {
              const publicKey = safeConvertSS58toPublicKey(address.address)

              if (!publicKey || !isWalletProviderType(address.provider)) {
                return null
              }

              return {
                address: address.address,
                name: address.name,
                provider: address.provider,
                isCustom: address.isCustom,
                publicKey,
              }
            })
            .filter((address) => address !== null),
        }),
      }),
    },
  ),
)
