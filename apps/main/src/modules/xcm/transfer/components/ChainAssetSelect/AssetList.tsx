import {
  ModalCloseTrigger,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import {
  formatSourceChainAddress,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"
import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { isBridgeAssetRoute } from "@/modules/xcm/transfer/utils/transfer"

const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

type AssetListItem = { asset: Asset; route: AssetRoute | null }

export type AssetListProps = {
  registryChain: AnyChain
  address: string
  items: AssetListItem[]
  selectedChain?: AnyChain
  selectedAsset?: Asset
  setSelectedAsset: (asset: Asset) => void
}

export const AssetList: React.FC<AssetListProps> = ({
  registryChain,
  address,
  items,
  selectedAsset,
  selectedChain,
  setSelectedAsset,
}) => {
  const { isLoading: isLoadingBalances } = useCrossChainBalanceSubscription(
    address,
    selectedChain?.key ?? "",
  )

  const { data: balances } = useCrossChainBalance(
    address,
    selectedChain?.key ?? "",
  )

  const itemSize = items.some(({ route }) => isBridgeAssetRoute(route))
    ? ASSET_ITEM_HEIGHT * 1.4
    : ASSET_ITEM_HEIGHT

  const formattedAddress = selectedChain
    ? formatSourceChainAddress(address, selectedChain)
    : ""

  const isAddressValid =
    !!selectedChain && isAddressValidOnChain(formattedAddress, selectedChain)

  return (
    <VirtualizedList
      items={items}
      itemSize={itemSize}
      maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
      initialScrollIndex={items.findIndex(
        ({ asset }) => asset === selectedAsset,
      )}
      renderItem={(item) => {
        const balance = balances?.get(item.asset.key)
        const isLoading = isAddressValid && isLoadingBalances && !balances
        const isSelectedAsset = selectedAsset?.key === item.asset.key

        return (
          <ModalCloseTrigger asChild>
            <AssetListItem
              {...item}
              chain={selectedChain}
              registryChain={registryChain}
              isSelected={isSelectedAsset}
              isLoading={isLoading}
              balance={balance}
              onClick={() => setSelectedAsset(item.asset)}
            />
          </ModalCloseTrigger>
        )
      }}
    />
  )
}
