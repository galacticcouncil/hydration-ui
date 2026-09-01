import {
  ModalCloseTrigger,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import {
  useCrossChainBalance,
  useCrossChainBalancesFetch,
  useHydrationAssetId,
} from "@/api/xcm"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { isBridgeAssetRoute } from "@/modules/xcm/transfer/utils/bridge"
import { useAssetsPrice } from "@/states/displayAsset"
import { numericallyStrDesc } from "@/utils/sort"

const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

type AssetListItem = { asset: Asset; route: AssetRoute | null }

export type AssetListProps = {
  address: string
  items: AssetListItem[]
  selectedChain?: AnyChain
  selectedAsset?: Asset
  setSelectedAsset: (asset: Asset) => void
}

export const AssetList: React.FC<AssetListProps> = ({
  address,
  items,
  selectedAsset,
  selectedChain,
  setSelectedAsset,
}) => {
  const getHydrationAssetId = useHydrationAssetId()
  const chainKey = selectedChain?.key ?? ""

  const priceIds = useMemo(
    () =>
      items
        .map((item) => getHydrationAssetId(item.asset, chainKey))
        .filter(isNonNullish),
    [items, getHydrationAssetId, chainKey],
  )

  const { getAssetPrice, isLoading: isAssetPriceLoading } =
    useAssetsPrice(priceIds)

  const { isLoading: isLoadingBalances } = useCrossChainBalancesFetch(
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

  const assetList = useMemo(() => {
    if (isLoadingBalances || isAssetPriceLoading) return items

    const assetsWithBalances = items.map((item) => {
      const registryId = getHydrationAssetId(item.asset, chainKey)
      const balance = balances?.get(item.asset.key)
      const { price } = getAssetPrice(registryId ?? "")
      return {
        ...item,
        balance,
        balanceDisplay:
          balance && price
            ? bigShift(balance.amount.toString(), -balance.decimals)
                .times(price)
                .toString()
            : undefined,
      }
    })

    return assetsWithBalances.sort((a, b) => {
      const byDisplay = numericallyStrDesc(
        a.balanceDisplay ?? "0",
        b.balanceDisplay ?? "0",
      )
      if (byDisplay !== 0) return byDisplay

      if (a.balance && a.balance.amount > 0n) return -1
      if (b.balance && b.balance.amount > 0n) return 1

      return 0
    })
  }, [
    balances,
    chainKey,
    getAssetPrice,
    getHydrationAssetId,
    isAssetPriceLoading,
    isLoadingBalances,
    items,
  ])

  const assetIndex = selectedAsset
    ? assetList.findIndex(({ asset }) => asset === selectedAsset)
    : 0

  const initialScrollIndex =
    assetIndex >= MAX_VISIBLE_ASSET_ITEMS ? assetIndex : 0

  return (
    <VirtualizedList
      items={assetList}
      itemSize={itemSize}
      maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
      initialScrollIndex={initialScrollIndex}
      renderItem={(item) => {
        const balance = balances?.get(item.asset.key)
        const isLoading = isLoadingBalances || isAssetPriceLoading
        const isSelectedAsset = selectedAsset?.key === item.asset.key

        return (
          <ModalCloseTrigger asChild>
            <AssetListItem
              {...item}
              chain={selectedChain}
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
