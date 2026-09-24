import {
  EvmAddr,
  parseNearAccountName,
  stringEquals,
} from "@galacticcouncil/utils"

import { getWalletModeName } from "@/utils/wallet"

import type { Address, NormalizedAddress } from "./AddressBook.store"

export function normalizeStoredAddress(address: Address): Address {
  if (!EvmAddr.isValid(address.address)) return address

  const normalized = address.address.toLowerCase()

  return {
    ...address,
    address: normalized,
    publicKey: address.publicKey.toLowerCase(),
  }
}

function mergeDuplicateEntries(a: Address, b: Address): Address {
  const [custom, wallet] = a.isCustom ? [a, b] : b.isCustom ? [b, a] : [a, b]

  const name =
    custom.isCustom && custom.name
      ? custom.name
      : !wallet.isCustom && wallet.name && wallet.name !== custom.name
        ? wallet.name
        : custom.name || wallet.name

  const savedBy =
    a.savedBy.length === 0 || b.savedBy.length === 0
      ? []
      : [...new Set([...a.savedBy, ...b.savedBy])]

  return normalizeStoredAddress({
    ...wallet,
    ...custom,
    name,
    savedBy,
    isCustom: a.isCustom || b.isCustom,
    provider: custom.provider ?? wallet.provider,
  })
}

export function dedupeAddresses(addresses: Address[]): Address[] {
  const byKey = new Map<string, Address>()

  for (const entry of addresses.map(normalizeStoredAddress)) {
    const key = entry.publicKey.toLowerCase()
    const existing = byKey.get(key)
    byKey.set(key, existing ? mergeDuplicateEntries(existing, entry) : entry)
  }

  return [...byKey.values()]
}

export function getAllAddresses(addresses: Address[]): Address[] {
  const indices = new Map<Address["mode"], number>()

  return addresses.map((address) => {
    if (address.name) {
      return address
    }

    const nearName = parseNearAccountName(address.address)
    if (nearName) {
      return { ...address, name: nearName }
    }

    const index = (indices.get(address.mode) ?? 0) + 1
    indices.set(address.mode, index)

    return {
      ...address,
      name: `${getWalletModeName(address.mode)} ${index}`,
    }
  })
}

export type AddressFilter = {
  mode?: Address["mode"]
  isCustom?: boolean
  related?: boolean
}

export function selectAddresses(
  addresses: Address[],
  filter: AddressFilter,
  connectedPublicKey: string | null,
): Address[] {
  return addresses.filter((a) => {
    if (filter.mode !== undefined && a.mode !== filter.mode) {
      return false
    }
    if (
      filter.isCustom !== undefined &&
      Boolean(a.isCustom) !== filter.isCustom
    ) {
      return false
    }
    if (filter.related !== undefined) {
      const isGlobal = a.savedBy.length === 0
      const isSavedByPubKey =
        !!connectedPublicKey &&
        a.savedBy.some((pk) => stringEquals(pk, connectedPublicKey))
      const related = isGlobal || isSavedByPubKey
      if (related !== filter.related) return false
    }
    return true
  })
}

export function isVisibleToWallet(
  address: Pick<Address, "isCustom" | "savedBy">,
  connectedPublicKey: string | null,
): boolean {
  if (!address.isCustom) return true
  if (address.savedBy.length === 0) return true
  return (
    connectedPublicKey !== null &&
    address.savedBy.some((pk) => stringEquals(pk, connectedPublicKey))
  )
}

export function deriveSavedBy(
  entry: Pick<Address, "isCustom" | "savedBy"> & { isGlobal?: boolean },
  connectedPublicKey: string | null,
): string[] {
  if (entry.isGlobal) return []
  if (!entry.isCustom) return entry.savedBy
  return connectedPublicKey ? [connectedPublicKey] : []
}

export function buildAddresses(
  existing: Address[],
  normalized: NormalizedAddress[],
  connectedPublicKey: string | null,
): Address[] {
  return mergeAddresses(
    existing,
    normalized.map(({ isGlobal, ...entry }) => ({
      ...entry,
      savedBy: deriveSavedBy({ ...entry, isGlobal }, connectedPublicKey),
    })),
  )
}

function mergeAddresses(existing: Address[], incoming: Address[]): Address[] {
  const incomingByKey = new Map(
    incoming.map((a) => [a.publicKey.toLowerCase(), a]),
  )
  const existingKeys = new Set(existing.map((a) => a.publicKey.toLowerCase()))

  const updated = existing.map((entry) => {
    const match = incomingByKey.get(entry.publicKey.toLowerCase())
    if (!match) return entry

    const savedBy =
      entry.savedBy.length === 0
        ? entry.savedBy
        : [...new Set([...entry.savedBy, ...match.savedBy])]
    const name =
      !entry.isCustom && entry.name !== match.name ? match.name : entry.name

    const changed =
      savedBy.length !== entry.savedBy.length || name !== entry.name
    return changed ? { ...entry, name, savedBy } : entry
  })

  const added = [...incomingByKey.values()].filter(
    (a) => !existingKeys.has(a.publicKey.toLowerCase()),
  )

  const hasChanges =
    added.length > 0 || updated.some((a, i) => a !== existing[i])

  return hasChanges ? dedupeAddresses([...updated, ...added]) : existing
}
