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
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isBigInt } from "remeda"

import { AssetBridgeTags } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetBridgeTags"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { isBridgeAssetRoute } from "@/modules/xcm/transfer/utils/transfer"
import { useAssets } from "@/providers/assetsProvider"
import { toDecimal } from "@/utils/formatting"

import { SAssetListItem } from "./AssetListItem.styled"

export type AssetListItemProps = {
  asset: Asset
  route: AssetRoute | null
  balance?: AssetAmount
  balanceDisplay?: string
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
  balanceDisplay,
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
      <Flex align="start" gap="base">
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
          <Flex direction="column" align="flex-end">
            <Text fs="p5" lh={1} fw={600}>
              {t("number", {
                value: toDecimal(balance.amount, balance.decimals),
                symbol: asset?.originSymbol,
              })}
            </Text>
            {Big(balanceDisplay ?? "0").gt(0) && (
              <Text fs="p6" color={getToken("text.low")}>
                {t("currency", {
                  value: balanceDisplay,
                })}
              </Text>
            )}
          </Flex>
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
