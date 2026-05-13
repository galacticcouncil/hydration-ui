import {
  createZustandStorage,
  isH160Address,
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
        set((state) => ({
          addresses: mergeAddresses(
            state.addresses,
            Array.isArray(address) ? address : [address],
          ),
        })),

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
    createZustandStorage({
      name: "address-book",
      version: 3,
      schema: stateSchema,
      defaultState,
      migrate: (persistedState, storedVersion) => {
        switch (storedVersion) {
          case 2:
            return migrateLegacyAddressBookV2(persistedState)
          default:
            return persistedState as State
        }
      },
    }),
  ),
)

function mergeAddresses(existing: Address[], incoming: Address[]): Address[] {
  const incomingByKey = new Map(incoming.map((a) => [a.publicKey, a]))
  const existingKeys = new Set(existing.map((a) => a.publicKey))

  const updated = existing.map((entry) => {
    const match = incomingByKey.get(entry.publicKey)
    const shouldUpdateName =
      match && !entry.isCustom && entry.name !== match.name

    if (shouldUpdateName) return { ...entry, name: match.name }
    return entry
  })

  const added = [...incomingByKey.values()].filter(
    (a) => !existingKeys.has(a.publicKey),
  )

  const hasChanges =
    added.length > 0 || updated.some((a, i) => a !== existing[i])

  return hasChanges ? [...updated, ...added] : existing
}

function migrateLegacyAddressBookV2(persistedState: unknown): State {
  const parsed = stateSchemaV2.safeParse(persistedState)

  if (!parsed.success) return defaultState

  return {
    addresses: parsed.data.addresses
      .map<Address | null>((address) => {
        if (!address.isCustom) return null

        const publicKey = isH160Address(address.address)
          ? address.address
          : safeConvertSS58toPublicKey(address.address)

        if (!publicKey || !isWalletProviderType(address.provider)) return null

        return {
          address: address.address,
          name: address.name,
          provider: address.provider,
          isCustom: address.isCustom,
          publicKey,
        }
      })
      .filter((address) => address !== null),
  }
}
