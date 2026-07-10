import { NearAddr, stringEquals } from "@galacticcouncil/utils"

import { getWalletModeName } from "@/utils/walletMode"

import type { Address, AddressPurpose } from "./AddressBook.store"

export function getAllAddresses(addresses: Address[]): Address[] {
  const indices = new Map<Address["mode"], number>()

  return addresses.map((address) => {
    if (address.name) {
      return address
    }

    const nearName = NearAddr.parseAccountName(address.address)
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
  purpose?: AddressPurpose
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
    if (
      filter.purpose !== undefined &&
      !getAddressPurposes(a).includes(filter.purpose)
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
  entry: Pick<Address, "isCustom" | "savedBy">,
  connectedPublicKey: string | null,
): string[] {
  if (!entry.isCustom) return entry.savedBy
  return connectedPublicKey ? [connectedPublicKey] : []
}

export function buildAddresses(
  existing: Address[],
  normalized: Address[],
  connectedPublicKey: string | null,
): Address[] {
  return mergeAddresses(
    existing,
    normalized.map((entry) => ({
      ...entry,
      savedBy: deriveSavedBy(entry, connectedPublicKey),
    })),
  )
}

function mergeAddresses(existing: Address[], incoming: Address[]): Address[] {
  const incomingByKey = new Map(incoming.map((a) => [getAddressKey(a), a]))
  const existingKeys = new Set(existing.map(getAddressKey))

  const updated = existing.map((entry) => {
    const match = incomingByKey.get(getAddressKey(entry))
    if (!match) return entry

    const savedBy = [...new Set([...entry.savedBy, ...match.savedBy])]
    const purposes = [
      ...new Set([...getAddressPurposes(entry), ...getAddressPurposes(match)]),
    ]
    const isCustom = entry.isCustom || match.isCustom
    const name =
      !entry.isCustom && match.name && entry.name !== match.name
        ? match.name
        : entry.name

    const changed =
      savedBy.length !== entry.savedBy.length ||
      purposes.length !== getAddressPurposes(entry).length ||
      name !== entry.name ||
      isCustom !== entry.isCustom
    return changed ? { ...entry, name, savedBy, isCustom, purposes } : entry
  })

  const added = [...incomingByKey.values()].filter(
    (a) => !existingKeys.has(a.publicKey.toLowerCase()),
  )

  const hasChanges =
    added.length > 0 || updated.some((a, i) => a !== existing[i])

  return hasChanges ? [...updated, ...added] : existing
}

function getAddressKey(address: Pick<Address, "publicKey">) {
  return address.publicKey.toLowerCase()
}

export function getAddressPurpose(
  address: Pick<Address, "isCustom" | "savedBy" | "purpose" | "purposes">,
): AddressPurpose {
  return getAddressPurposes(address)[0] ?? "addressBook"
}

export function getAddressPurposes(
  address: Pick<Address, "isCustom" | "savedBy" | "purpose" | "purposes">,
): AddressPurpose[] {
  if (address.purposes?.length) return address.purposes
  if (address.purpose) return [address.purpose]
  if (!address.isCustom) return ["addressBook"]
  return [address.savedBy.length > 0 ? "tracked" : "viewAs"]
}
