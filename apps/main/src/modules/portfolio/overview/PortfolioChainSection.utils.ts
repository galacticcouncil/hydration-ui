import { AssetAmount } from "@galacticcouncil/xc-core"

import { AssetType, TAssetData } from "@/api/assets"

export const toSourceChainAssetData = (
  chainKey: string,
  balance: AssetAmount,
  registryAsset: TAssetData | undefined,
  externalIconSrc?: string,
): TAssetData => {
  const sourceSymbol = balance.symbol || balance.originSymbol

  if (!registryAsset) {
    return {
      id: `${chainKey}-${balance.key}`,
      existentialDeposit: "0",
      symbol: sourceSymbol,
      decimals: balance.decimals,
      name: balance.originSymbol,
      isTradable: false,
      isSufficient: false,
      type: AssetType.Unknown as const,
      iconSrc: externalIconSrc,
    }
  }

  const registryMirrorsSource =
    registryAsset.symbol.toLowerCase() === sourceSymbol.toLowerCase()

  return {
    ...registryAsset,
    symbol: sourceSymbol,
    name: registryMirrorsSource ? registryAsset.name : balance.originSymbol,
    iconSrc: registryMirrorsSource
      ? registryAsset.iconSrc || externalIconSrc
      : externalIconSrc || registryAsset.iconSrc,
    chainSrc: undefined,
  }
}
