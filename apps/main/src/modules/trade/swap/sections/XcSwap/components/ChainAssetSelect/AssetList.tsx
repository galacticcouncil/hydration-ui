import {
  ModalCloseTrigger,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import { AssetListItem } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/AssetListItem"
import {
  XC_SWAP_ASSET_ITEM_HEIGHT,
  XC_SWAP_MAX_VISIBLE_ASSET_ITEMS,
} from "@/modules/trade/swap/sections/XcSwap/config/ui"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/types"

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
    assetIndex >= XC_SWAP_MAX_VISIBLE_ASSET_ITEMS ? assetIndex : 0

  return (
    <VirtualizedList
      sx={{
        height: pxToRem(
          XC_SWAP_ASSET_ITEM_HEIGHT * XC_SWAP_MAX_VISIBLE_ASSET_ITEMS,
        ),
      }}
      items={items}
      itemSize={XC_SWAP_ASSET_ITEM_HEIGHT}
      maxVisibleItems={XC_SWAP_MAX_VISIBLE_ASSET_ITEMS}
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
