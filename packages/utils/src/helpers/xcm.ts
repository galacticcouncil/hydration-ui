import { AnyChain, Asset, EvmChain, Parachain } from "@galacticcouncil/xcm-core"

export function getChainAssetId(chain: AnyChain, asset: Asset) {
  if (chain instanceof Parachain) {
    return chain.getMetadataAssetId(asset) || 0
  }
  return chain.getAssetId(asset)
}

export function getChainId(chain: AnyChain) {
  switch (true) {
    case chain instanceof EvmChain:
      return chain.evmChain.id
    case chain instanceof Parachain:
      return chain.parachainId
    default:
      return chain.id
  }
}
