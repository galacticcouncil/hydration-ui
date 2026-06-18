import {
  ModalCloseTrigger,
  VirtualizedList,
} from "@galacticcouncil/ui/components"

import { AssetListItem } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/AssetListItem"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"

const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

export type AssetListProps = {
  items: XcAsset[]
  selectedAsset?: XcAsset
  setSelectedAsset: (asset: XcAsset) => void
}

export const AssetList: React.FC<AssetListProps> = ({
  items,
  selectedAsset,
  setSelectedAsset,
}) => {
  const assetIndex = selectedAsset
    ? items.findIndex(({ key }) => key === selectedAsset.key)
    : 0

  const initialScrollIndex =
    assetIndex >= MAX_VISIBLE_ASSET_ITEMS ? assetIndex : 0

  return (
    <VirtualizedList
      items={items}
      itemSize={ASSET_ITEM_HEIGHT}
      maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
      initialScrollIndex={initialScrollIndex}
      renderItem={(asset) => (
        <ModalCloseTrigger asChild>
          <AssetListItem
            asset={asset}
            isSelected={selectedAsset?.key === asset.key}
            onClick={() => setSelectedAsset(asset)}
          />
        </ModalCloseTrigger>
      )}
    />
  )
}
