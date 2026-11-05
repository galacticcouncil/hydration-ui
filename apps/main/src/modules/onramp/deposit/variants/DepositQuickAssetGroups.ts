import type { AnyChain, Asset } from "@galacticcouncil/xc-core"

export type DepositAssetNetworkPair = { asset: Asset; chain: AnyChain }
export type NamedDepositAssetPair = DepositAssetNetworkPair & { name: string }
export type DepositQuickAssetGroup = NamedDepositAssetPair & {
  key: string
  sources: DepositAssetNetworkPair[]
}

/** Group by SDK asset identity, retaining every exact chain/asset source pair. */
export const groupDepositAssetOptions = (
  items: NamedDepositAssetPair[],
  chainKey = "all",
  search = "",
): DepositQuickAssetGroup[] => {
  const query = search.trim().toLowerCase()
  const groups = new Map<string, DepositQuickAssetGroup>()
  for (const item of items) {
    const { asset, chain, name } = item
    if (chainKey !== "all" && chain.key !== chainKey) continue
    if (
      !`${asset.originSymbol} ${asset.key} ${name} ${chain.name}`
        .toLowerCase()
        .includes(query)
    )
      continue
    const group = groups.get(asset.key)
    if (group) {
      if (!group.sources.some((source) => source.chain.key === chain.key))
        group.sources.push({ asset, chain })
    } else {
      groups.set(asset.key, {
        ...item,
        key: asset.key,
        sources: [{ asset, chain }],
      })
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.asset.originSymbol.localeCompare(b.asset.originSymbol) ||
      a.key.localeCompare(b.key),
  )
}
