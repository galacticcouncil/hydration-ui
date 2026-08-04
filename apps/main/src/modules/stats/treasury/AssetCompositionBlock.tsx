import { Box, Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import type {
  GroupedCompositionAsset,
  TreasuryCompositionAsset,
} from "@/api/treasury"
import { AssetLogo } from "@/components/AssetLogo"
import {
  CompositionAssetWithColor,
  CompositionBlockLayout,
  CompositionOthersBlock,
} from "@/modules/stats/treasury/StatsComposition.utils"
import {
  SCompositionBlock_,
  SCompositionOthersLogos,
  STooltipRow,
  STooltipSection,
  STooltipValues,
} from "@/modules/stats/treasury/StatsTreasury.styled"

const getSymbolSize = (symbolSize: CompositionBlockLayout["symbolSize"]) => {
  return symbolSize === "large"
    ? ["p4", "p5"]
    : symbolSize === "medium"
      ? ["p6", "p7"]
      : ["p7", pxToRem(10)]
}

const getValueSize = (shareSize: CompositionBlockLayout["shareSize"]) => {
  return shareSize === "xlarge"
    ? ["p4", "h5"]
    : shareSize === "large"
      ? ["p5", "p4"]
      : shareSize === "medium"
        ? ["p6", "p5"]
        : ["p7", "p6"]
}

const getShareSize = (shareSize: CompositionBlockLayout["shareSize"]) => {
  return shareSize === "xlarge"
    ? ["p7", "p5"]
    : shareSize === "large"
      ? ["p7", "p6"]
      : shareSize === "medium"
        ? [pxToRem(10), "p7"]
        : [pxToRem(10), pxToRem(10)]
}

const CompositionBlockContent = ({
  logo,
  symbol,
  valueUsd,
  share,
  layout,
}: {
  logo: ReactNode
  symbol: string
  valueUsd: string | null | undefined
  share: number
  layout: CompositionBlockLayout
}) => {
  const { t } = useTranslation("common")
  const symbolSize = getSymbolSize(layout.symbolSize)
  const valueShareSize = getValueSize(layout.shareSize)
  const shareSize = getShareSize(layout.shareSize)

  return (
    <Flex
      direction="column"
      gap="s"
      justify="space-between"
      width="100%"
      height="100%"
    >
      <Flex align="start" gap={["xs", "s"]}>
        {logo}
        <Text
          color={getToken("text.high")}
          fs={symbolSize}
          fw={600}
          lh={1.1}
          truncate
        >
          {symbol}
        </Text>
      </Flex>
      <Flex direction="column" gap={pxToRem(2)}>
        <Text
          fs={valueShareSize}
          fw={600}
          lh={1}
          color={getToken("text.high")}
          font="primary"
        >
          {t("currency.compact", { value: valueUsd })}
        </Text>
        <Text fs={shareSize} fw={500} color={getToken("text.medium")} lh={1}>
          {t("percent", { value: share })}
        </Text>
      </Flex>
    </Flex>
  )
}

export const AssetCompositionBlock = ({
  block,
  layout,
}: {
  block: CompositionAssetWithColor
  layout: CompositionBlockLayout
}) => {
  return (
    <Tooltip
      text={<AssetDetailsTooltipContent item={block} />}
      asChild
      sxContent={{ p: "base" }}
    >
      <SCompositionBlock_
        colSpan={layout.colSpan}
        rowSpan={layout.rowSpan}
        backgroundColor={block.color}
      >
        <CompositionBlockContent
          logo={<AssetLogo id={block.asset.id} size="extra-small" />}
          symbol={block.asset.symbol}
          valueUsd={block.totalValueDisplay}
          share={block.share}
          layout={layout}
        />
      </SCompositionBlock_>
    </Tooltip>
  )
}

export const OthersCompositionBlock = ({
  block,
  layout,
}: {
  block: CompositionOthersBlock
  layout: CompositionBlockLayout
}) => {
  const { t } = useTranslation("stats")

  return (
    <Tooltip
      text={<OthersDetailsTooltipContent items={block.items} />}
      asChild
      sxContent={{ p: "base" }}
    >
      <SCompositionBlock_
        colSpan={layout.colSpan}
        rowSpan={layout.rowSpan}
        backgroundColor={block.color}
      >
        <CompositionBlockContent
          logo={
            <SCompositionOthersLogos>
              {block.items.slice(0, 4).map((item) => (
                <AssetLogo
                  key={item.asset.id}
                  id={item.asset.id}
                  size="extra-small"
                />
              ))}
            </SCompositionOthersLogos>
          }
          symbol={t("treasury.composition.others")}
          valueUsd={block.totalValueDisplay}
          share={block.share}
          layout={layout}
        />
      </SCompositionBlock_>
    </Tooltip>
  )
}

const TooltipContainer = ({ children }: { children: ReactNode }) => (
  <Flex direction="column" gap="base" minWidth={pxToRem(150)}>
    {children}
  </Flex>
)

const OverflowContainer = ({ children }: { children: ReactNode }) => (
  <Flex gap="base" align="center" sx={{ overflow: "hidden" }}>
    {children}
  </Flex>
)

const TooltipTitle = ({ children }: { children: ReactNode }) => (
  <Text
    fs="p6"
    fw={600}
    lh={1.1}
    color={getToken("text.medium")}
    transform="uppercase"
  >
    {children}
  </Text>
)

const OTHERS_TOOLTIP_VISIBLE_LIMIT = 10

const OthersDetailsTooltipContent = ({
  items,
}: {
  items: TreasuryCompositionAsset[]
}) => {
  const { t } = useTranslation(["stats", "common"])
  const visibleItems = items.slice(0, OTHERS_TOOLTIP_VISIBLE_LIMIT)
  const hiddenItems = items.slice(OTHERS_TOOLTIP_VISIBLE_LIMIT)
  const hiddenCount = hiddenItems.length
  const hiddenTotalUsd = hiddenItems.reduce(
    (acc, item) => acc + Number(item.totalValueDisplay ?? 0),
    0,
  )

  return (
    <TooltipContainer>
      <Text
        fs="p6"
        fw={600}
        lh={1.1}
        color={getToken("text.medium")}
        transform="uppercase"
      >
        {t("treasury.composition.otherAssets")}
      </Text>
      <Box>
        {visibleItems.map((item) => (
          <STooltipRow key={item.asset.id}>
            <OverflowContainer>
              <AssetLogo id={item.asset.id} size="extra-small" />
              <Text fs="p7" fw={600} lh={1.1} color={getToken("text.high")}>
                {item.asset.symbol}
              </Text>
            </OverflowContainer>
            <STooltipValues>
              <Text fs="p7" fw={600} lh={1} color={getToken("text.high")}>
                {t("common:currency.compact", {
                  value: item.totalValueDisplay,
                })}
              </Text>
              <Text fs="p7" lh={1} color={getToken("text.medium")}>
                {t("common:percent", {
                  value: item.share,
                })}
              </Text>
            </STooltipValues>
          </STooltipRow>
        ))}
        {hiddenCount > 0 ? (
          <STooltipRow>
            <OverflowContainer>
              <Text fs="p7" fw={500} color={getToken("text.medium")}>
                {t("treasury.composition.moreAssets", { count: hiddenCount })}
              </Text>
            </OverflowContainer>
            <STooltipValues>
              <Text fs="p7" fw={600} color={getToken("text.high")}>
                {t("common:currency.compact", {
                  value: hiddenTotalUsd,
                })}
              </Text>
            </STooltipValues>
          </STooltipRow>
        ) : null}
      </Box>
    </TooltipContainer>
  )
}

const AssetDetailsTooltipContent = ({
  item,
}: {
  item: GroupedCompositionAsset
}) => {
  const { t } = useTranslation(["stats", "common"])
  const groupedAssets = item.groupedAssets ?? []
  const isGroupedAsset = groupedAssets.length > 1

  return (
    <TooltipContainer>
      <Flex gap="base" align="start" justify="space-between">
        <OverflowContainer>
          <AssetLogo
            id={item.asset.id}
            size="extra-small"
            hideChain={isGroupedAsset}
          />
          <Flex direction="column" gap="xs">
            <Text fs="p6" fw={600} lh={1} color="text.high">
              {item.asset.symbol}
            </Text>
            <Text fs="p7" lh={1} color="text.high">
              {item.asset.name}
            </Text>
          </Flex>
        </OverflowContainer>
        <Text fs="p7" fw={600} color="text.high">
          {t("common:percent", { value: item.share })}
        </Text>
      </Flex>
      {isGroupedAsset ? (
        <>
          <TooltipTitle>{t("treasury.composition.consistingOf")}</TooltipTitle>
          <STooltipSection>
            {groupedAssets.map((groupedAsset) => (
              <STooltipRow key={groupedAsset.asset.id}>
                <OverflowContainer>
                  <AssetLogo id={groupedAsset.asset.id} size="extra-small" />
                  <Flex direction="column" gap="xs">
                    <Text fs="p7" fw={600} lh={1.1} color="text.high">
                      {groupedAsset.asset.symbol}
                    </Text>
                    <Text fs="p7" lh={1.1} color="text.high">
                      {groupedAsset.asset.name}
                    </Text>
                  </Flex>
                </OverflowContainer>
                <STooltipValues>
                  <Text fs="p7" fw={600} color="text.high">
                    {t("common:currency.compact", {
                      value: groupedAsset.totalBalance,
                    })}
                  </Text>
                  <Text fs="p7" color={getToken("text.medium")}>
                    {t("common:currency.compact", {
                      value: groupedAsset.totalValueDisplay,
                    })}
                  </Text>
                </STooltipValues>
              </STooltipRow>
            ))}
          </STooltipSection>
        </>
      ) : null}

      <STooltipSection>
        <STooltipRow>
          <OverflowContainer>
            <Text fs="p7" fw={500} color="text.high">
              {t("treasury.composition.totalBalance")}
            </Text>
          </OverflowContainer>
          <STooltipValues>
            <Text fs="p7" fw={600} color="text.high">
              {t("common:currency.compact", {
                value: item.totalBalance,
                symbol: item.asset.symbol,
              })}
            </Text>
            <Text fs="p7" color={getToken("text.medium")}>
              {t("common:currency.compact", {
                value: item.totalValueDisplay,
              })}
            </Text>
          </STooltipValues>
        </STooltipRow>
      </STooltipSection>

      {item.netSupply ? (
        <>
          <TooltipTitle>
            {t("treasury.composition.collateralDebt")}
          </TooltipTitle>
          <STooltipSection>
            <STooltipRow>
              <OverflowContainer>
                <Text fs="p7" fw={500} color="text.high">
                  {t("treasury.composition.netCollateral")}
                </Text>
              </OverflowContainer>
              <STooltipValues>
                <Text fs="p7" fw={600} color="text.high">
                  {t("common:currency.compact", {
                    value: item.netSupply,
                    symbol: item.asset.symbol,
                  })}
                </Text>
                <Text fs="p7" color={getToken("text.medium")}>
                  {t("common:currency.compact", {
                    value: item.netSupplyBalanceDisplay,
                  })}
                </Text>
              </STooltipValues>
            </STooltipRow>

            <STooltipRow>
              <OverflowContainer>
                <Text fs="p7" fw={500} color="text.high">
                  {t("treasury.composition.suppliedAsCollateral")}
                </Text>
              </OverflowContainer>
              <STooltipValues>
                <Text fs="p7" fw={600} color="text.high">
                  {t("common:currency.compact", {
                    value: item.supply,
                    symbol: item.asset.symbol,
                  })}
                </Text>
                <Text fs="p7" color={getToken("text.medium")}>
                  {t("common:currency.compact", {
                    value: item.supplyBalanceDisplay,
                  })}
                </Text>
              </STooltipValues>
            </STooltipRow>

            <STooltipRow>
              <OverflowContainer>
                <Text fs="p7" fw={500} color="text.high">
                  {t("treasury.composition.collateralUsedByDebt")}
                </Text>
              </OverflowContainer>
              <STooltipValues>
                <Text fs="p7" fw={600} color="text.high">
                  -
                  {t("common:currency.compact", {
                    value: item.debt,
                    symbol: item.asset.symbol,
                  })}
                </Text>
                <Text fs="p7" color={getToken("text.medium")}>
                  -
                  {t("common:currency.compact", {
                    value: item.debtBalanceDisplay,
                  })}
                </Text>
              </STooltipValues>
            </STooltipRow>
          </STooltipSection>
        </>
      ) : null}

      {Big(item.liquidity).gt(0) ||
      Big(item.wallet).gt(0) ||
      Big(item.offchain).gt(0) ? (
        <>
          <TooltipTitle>{t("treasury.composition.breakdown")}</TooltipTitle>
          <STooltipSection>
            {Big(item.wallet).gt(0) ? (
              <STooltipRow>
                <OverflowContainer>
                  <Text fs="p7" fw={500} color="text.high">
                    {t("treasury.composition.assetBalance")}
                  </Text>
                </OverflowContainer>
                <STooltipValues>
                  <Text fs="p7" fw={600} color="text.high">
                    {t("common:currency.compact", {
                      value: item.wallet,
                      symbol: item.asset.symbol,
                    })}
                  </Text>
                  <Text fs="p7" color={getToken("text.medium")}>
                    {t("common:currency.compact", {
                      value: item.assetWalletDisplay,
                    })}
                  </Text>
                </STooltipValues>
              </STooltipRow>
            ) : null}
            {Big(item.liquidity).gt(0) ? (
              <STooltipRow>
                <OverflowContainer>
                  <Text fs="p7" fw={500} color="text.high">
                    {t("treasury.composition.suppliedAsLiquidity")}
                  </Text>
                </OverflowContainer>
                <STooltipValues>
                  <Text fs="p7" fw={600} color="text.high">
                    {t("common:currency.compact", {
                      value: item.liquidity,
                      symbol: item.asset.symbol,
                    })}
                  </Text>
                  <Text fs="p7" color={getToken("text.medium")}>
                    {t("common:currency.compact", {
                      value: Big(item.liquidity)
                        .times(item.price ?? 1)
                        .toString(),
                    })}
                  </Text>
                </STooltipValues>
              </STooltipRow>
            ) : null}
            {Big(item.offchain).gt(0) ? (
              <STooltipRow>
                <OverflowContainer>
                  <Text fs="p7" fw={500} color="text.high">
                    {t("treasury.composition.offchain")}
                  </Text>
                </OverflowContainer>
                <STooltipValues>
                  <Text fs="p7" fw={600} color="text.high">
                    {t("common:currency.compact", {
                      value: item.offchain,
                      symbol: item.asset.symbol,
                    })}
                  </Text>
                  <Text fs="p7" color={getToken("text.medium")}>
                    {t("common:currency.compact", {
                      value: Big(item.offchain)
                        .times(item.price ?? 1)
                        .toString(),
                    })}
                  </Text>
                </STooltipValues>
              </STooltipRow>
            ) : null}
          </STooltipSection>
        </>
      ) : null}
    </TooltipContainer>
  )
}
