import {
  AssetLabel,
  Flex,
  ModalCloseTrigger,
  Skeleton,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { useTranslation } from "react-i18next"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type ChainAssetPair = {
  chain: AnyChain
  assets: Asset[]
}

const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

export type AssetListProps = {
  address: string
  items: Asset[]
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
  const { registryChain } = useXcmProvider()
  const { getAsset } = useAssets()
  const { t } = useTranslation(["common"])

  const { isLoading: isBalancesLoading } = useCrossChainBalanceSubscription(
    address,
    selectedChain?.key ?? "",
  )

  const { data: balances } = useCrossChainBalance(
    address,
    selectedChain?.key ?? "",
  )

  return (
    <VirtualizedList
      items={items.map((asset) => ({ asset }))}
      itemSize={ASSET_ITEM_HEIGHT}
      maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
      initialScrollIndex={items.findIndex((asset) => asset === selectedAsset)}
      renderItem={(item: { asset: Asset }) => {
        const { asset } = item
        const registryId = registryChain.getBalanceAssetId(asset)
        const registryAsset = getAsset(registryId.toString())
        const balance = balances?.get(asset.key)
        const isLoading = isBalancesLoading && !balances
        const isSelectedAsset = selectedAsset?.key === asset.key

        return (
          <ModalCloseTrigger asChild>
            <Flex
              justify="space-between"
              align="center"
              px={10}
              height="100%"
              onClick={() => setSelectedAsset(asset)}
              sx={{
                borderBottom: "1px solid",
                borderBottomColor: getToken("details.separators"),
                cursor: "pointer",
                background: isSelectedAsset
                  ? getToken("accents.info.accent")
                  : "transparent",
                "&:hover": {
                  background: getToken("details.separators"),
                },
              }}
            >
              <Flex align="center" gap={8}>
                {selectedChain && (
                  <XAssetLogo asset={asset} chain={selectedChain} />
                )}

                <AssetLabel
                  symbol={registryAsset?.symbol || asset.originSymbol}
                  name={registryAsset?.name}
                />
              </Flex>
              <Text fs="p4" fw={500}>
                {isLoading ? (
                  <Skeleton width={60} />
                ) : (
                  t("currency", {
                    value: balance
                      ? scaleHuman(balance.amount, balance.decimals)
                      : "0",
                    symbol: asset?.originSymbol,
                  })
                )}
              </Text>
            </Flex>
          </ModalCloseTrigger>
        )
      }}
    />
  )
}
