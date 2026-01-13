import { Minus } from "@galacticcouncil/ui/assets/icons"
import {
  AssetLabel,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  AnyChain,
  Asset,
  AssetAmount,
  AssetRoute,
} from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"
import { isBigInt } from "remeda"

import { AssetBridgeTags } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetBridgeTags"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { isBridgeAssetRoute } from "@/modules/xcm/transfer/utils/transfer"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

import { SAssetListItem } from "./AssetListItem.styled"

export type AssetListItemProps = {
  asset: Asset
  route: AssetRoute | null
  balance?: AssetAmount
  isLoading: boolean
  isSelected: boolean
  chain?: AnyChain
  registryChain: AnyChain
  onClick: () => void
}

export const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  route,
  balance,
  chain,
  isLoading,
  isSelected,
  registryChain,
  onClick,
}) => {
  const { t } = useTranslation(["common"])
  const { getAsset } = useAssets()

  const registryId = registryChain.getBalanceAssetId(asset)
  const registryAsset = getAsset(registryId.toString())

  return (
    <SAssetListItem isSelected={isSelected} onClick={onClick} as="button">
      <Flex align="start" gap={8}>
        {chain && <XAssetLogo asset={asset} chain={chain} />}

        <Text truncate as="div">
          <AssetLabel
            symbol={registryAsset?.symbol || asset.originSymbol}
            name={registryAsset?.name}
          />
          {route && isBridgeAssetRoute(route) && (
            <AssetBridgeTags route={route} />
          )}
        </Text>
      </Flex>
      <Text
        fs="p4"
        fw={500}
        color={
          isBigInt(balance?.amount) && balance.amount > 0n
            ? getToken("text.high")
            : getToken("text.low")
        }
      >
        {isLoading ? (
          <Skeleton width={60} />
        ) : balance ? (
          t("currency", {
            value: scaleHuman(balance.amount, balance.decimals),
            symbol: asset?.originSymbol,
          })
        ) : (
          <Icon
            as="span"
            display="inline-flex"
            color={getToken("text.low")}
            component={Minus}
            size={16}
          />
        )}
      </Text>
    </SAssetListItem>
  )
}
