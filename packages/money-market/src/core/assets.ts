import type { Address } from "viem"

/** Chain addresses are lowercased at decode; a caller's may be checksummed. */
export function isAsset(a: Address, b: Address): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

/** The entry for `asset`; an asset outside the market is a caller error. */
export function findByAsset<Entry extends { underlyingAsset: Address }>(
  entries: Entry[],
  asset: Address,
): Entry {
  const entry = entries.find((candidate) =>
    isAsset(candidate.underlyingAsset, asset),
  )
  if (!entry) throw new Error(`No reserve for ${asset} in this market`)

  return entry
}
