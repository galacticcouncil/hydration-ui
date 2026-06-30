import { Flex } from "@galacticcouncil/ui/components"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useMemo } from "react"

import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import {
  TAssetWithBalance,
  useAssetSelectModalAssets,
} from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { AssetList } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/AssetList"
import {
  XcAsset,
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly chain: XcChain
  readonly search: string
  readonly selectedAsset?: XcAsset
  readonly onAssetSelect: (selection: XcChainAssetPair) => void
}

const toXcAsset = (
  asset: TAssetWithBalance,
  originAssetMap: Map<string, XcAsset>,
): XcAsset => {
  return {
    ...(originAssetMap.get(asset.id) ?? {
      key: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      logo: asset.iconSrc ?? "",
      id: Number(asset.id),
    }),
    logoId: asset.id,
    balance: asset.balance,
    balanceUsd: asset.balanceDisplay,
  }
}

export const HydrationAssetList: React.FC<Props> = ({
  chain,
  search,
  selectedAsset,
  onAssetSelect,
}) => {
  const { tradable } = useAssets()
  const { originAssetMap } = useXcSwap()

  const buyableAssets = useMemo(
    () => tradable.filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id)),
    [tradable],
  )

  const { sortedAssets } = useAssetSelectModalAssets({
    assets: buyableAssets,
    search,
    selectedAssetId:
      selectedAsset?.id !== undefined ? String(selectedAsset.id) : undefined,
  })

  const assets = useMemo(
    () => sortedAssets.map((asset) => toXcAsset(asset, originAssetMap)),
    [originAssetMap, sortedAssets],
  )

  return assets.length ? (
    <AssetList
      items={assets}
      selectedAsset={selectedAsset}
      setSelectedAsset={(asset) => onAssetSelect({ chain, asset })}
    />
  ) : (
    <Flex flex={1} align="center" justify="center">
      <AssetSelectEmptyState />
    </Flex>
  )
}
