import { Minus } from "@galacticcouncil/ui/assets/icons"
import { AssetLabel, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"

import { SAssetListItem } from "./AssetListItem.styled"

export type AssetListItemProps = {
  asset: XcAsset
  isSelected: boolean
  onClick: () => void
}

export const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  isSelected,
  onClick,
}) => {
  const hasBalance = Number(asset.balance) > 0

  return (
    <SAssetListItem isSelected={isSelected} onClick={onClick} as="button">
      <Flex align="start" gap="base">
        <XcLogo src={asset.logo} />
        <Text truncate as="div">
          <AssetLabel symbol={asset.symbol} name={asset.name} />
        </Text>
      </Flex>
      <Text
        fs="p4"
        fw={500}
        as="div"
        color={hasBalance ? getToken("text.high") : getToken("text.low")}
      >
        {hasBalance ? (
          <Flex direction="column" align="flex-end">
            <Text fs="p5" lh={1} fw={600}>
              {asset.balance} {asset.symbol}
            </Text>
            <Text fs="p6" color={getToken("text.low")}>
              ${asset.balanceUsd}
            </Text>
          </Flex>
        ) : (
          <Icon
            as="span"
            display="inline-flex"
            color={getToken("text.low")}
            component={Minus}
            size="m"
          />
        )}
      </Text>
    </SAssetListItem>
  )
}
