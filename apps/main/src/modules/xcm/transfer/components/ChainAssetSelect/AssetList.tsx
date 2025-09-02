import {
  AssetLabel,
  Chip,
  Flex,
  ModalCloseTrigger,
  Skeleton,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xcm-core"
import { useTranslation } from "react-i18next"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useAssets } from "@/providers/assetsProvider"
import { XCM_BRIDGE_TAGS, XcmTag, XcmTags } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

const ASSET_ITEM_HEIGHT = 50
const MAX_VISIBLE_ASSET_ITEMS = 8

export type AssetListProps = {
  address: string
  items: { asset: Asset; route: AssetRoute | null }[]
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

  const itemSize = items.some(({ route }) => hasBridge(route))
    ? ASSET_ITEM_HEIGHT * 1.4
    : ASSET_ITEM_HEIGHT

  return (
    <VirtualizedList
      items={items}
      itemSize={itemSize}
      maxVisibleItems={MAX_VISIBLE_ASSET_ITEMS}
      initialScrollIndex={items.findIndex(
        ({ asset }) => asset === selectedAsset,
      )}
      renderItem={(item) => {
        const { asset, route } = item
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
              gap={10}
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
              <Flex align="start" gap={8}>
                {selectedChain && (
                  <XAssetLogo asset={asset} chain={selectedChain} />
                )}

                <Text truncate as="div">
                  <AssetLabel
                    symbol={registryAsset?.symbol || asset.originSymbol}
                    name={registryAsset?.name}
                  />
                  {hasBridge(route) && (
                    <Flex align="center" gap={4} mt={2}>
                      {route?.tags?.includes(XcmTag.Wormhole) && (
                        <Chip variant="info" size="small">
                          Wormhole
                        </Chip>
                      )}
                      {route?.tags?.includes(XcmTag.Snowbridge) && (
                        <Chip variant="info" size="small">
                          Snowbridge
                        </Chip>
                      )}
                    </Flex>
                  )}
                </Text>
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

function hasBridge(route: AssetRoute | null): boolean {
  const tags = (route?.tags ?? []) as XcmTags
  return tags.some((tag) => XCM_BRIDGE_TAGS.includes(tag))
}
