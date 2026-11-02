import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  AssetLabel,
  Flex,
  Icon,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getChainId } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { SAssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem.styled"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"

import {
  DepositAssetNetworkPair,
  DepositQuickAssetGroup,
} from "./DepositQuickAssetGroups"

type DepositQuickAssetGroupRowProps = {
  group: DepositQuickAssetGroup
  selection: DepositAssetNetworkPair | null
  onSelect: () => void
  balance?: string
}

export const DepositQuickAssetGroupRow: FC<DepositQuickAssetGroupRowProps> = ({
  group,
  selection,
  onSelect,
  balance,
}) => {
  const { t } = useTranslation("common")
  return (
    <SAssetListItem
      as="button"
      aria-label={
        balance === undefined
          ? group.asset.originSymbol
          : `${group.asset.originSymbol}, ${t("number", { value: balance })}`
      }
      isSelected={
        group.asset.key === selection?.asset.key &&
        group.sources.some(({ chain }) => chain.key === selection.chain.key)
      }
      data-deposit-asset={group.key}
      onClick={onSelect}
    >
      <Flex align="center" gap="base" minWidth={0}>
        <XAssetLogo
          asset={group.asset}
          chain={group.chain}
          showChainLogo={false}
        />
        <Text truncate as="div">
          <AssetLabel symbol={group.asset.originSymbol} name={group.name} />
        </Text>
      </Flex>
      <Flex gap="s" align="center" flexShrink={0}>
        {balance !== undefined && (
          <Text fs="p5" fw={600}>
            {t("number", { value: balance })}
          </Text>
        )}
        {group.sources.slice(0, 4).map(({ chain }) => (
          <Tooltip key={chain.key} text={chain.name} size="small" asChild>
            <Flex as="span">
              <ChainLogo
                ecosystem={chain.ecosystem}
                chainId={getChainId(chain)}
                size="extra-small"
                alt={chain.name}
              />
            </Flex>
          </Tooltip>
        ))}
        {group.sources.length > 4 && (
          <Text as="span" fs="p6">
            +{group.sources.length - 4}
          </Text>
        )}
        {group.sources.length > 1 && <Icon component={ChevronRight} size="s" />}
      </Flex>
    </SAssetListItem>
  )
}
