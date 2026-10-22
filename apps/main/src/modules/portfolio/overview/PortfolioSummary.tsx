import {
  Box,
  Flex,
  ScrollArea,
  Stack,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { isMobileDevice } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC, memo, ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useWalletBalancesSectionData } from "@/modules/portfolio/overview/Balances/WalletBalances.data"
import {
  SPortfolioClaimButton,
  SPortfolioOverviewStat,
  SPortfolioOverviewStats,
} from "@/modules/portfolio/overview/PortfolioOverview.styled"
import {
  BreakdownRow,
  WalletRewardsBreakdownTooltipContent,
} from "@/modules/portfolio/overview/Rewards/WalletRewardsBreakdownTooltipContent"
import { useClaimAllWalletRewards } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.claim"
import { useWalletRewardsSectionData } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.data"

type MarketValues = { main: string; giga: string; bil: string }

const MarketBreakdownTooltipContent: FC<{ values: MarketValues }> = ({
  values,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Stack gap="s">
      {(Object.keys(values) as Array<keyof MarketValues>)
        .filter((market) => Big(values[market]).gt(0))
        .map((market) => (
          <BreakdownRow
            key={market}
            label={t(`myAssets.market.${market}`)}
            value={t("common:currency", { value: values[market] })}
          />
        ))}
    </Stack>
  )
}

const getMarketBreakdownTooltip = (values: MarketValues) =>
  Object.values(values).filter((value) => Big(value).gt(0)).length > 1 ? (
    <MarketBreakdownTooltipContent values={values} />
  ) : undefined

export const PortfolioSummary: FC = memo(() => {
  const { t } = useTranslation(["wallet", "common"])
  const { gte } = useBreakpoints()
  const isLg = gte("lg")

  const {
    assets,
    isAssetsLoading,
    liquidity,
    isLiquidityLoading,
    borrow,
    isBorrowLoading,
    supply,
    borrowByMarket,
    supplyByMarket,
  } = useWalletBalancesSectionData()

  const rewards = useWalletRewardsSectionData()
  const claimAll = useClaimAllWalletRewards()

  const [, { price: referralUsd, isLoading: referralPriceLoading }] =
    useDisplayAssetPrice(rewards.referral.assetId, rewards.referral.value)

  const netWorth = useMemo(
    () =>
      Big(assets || 0)
        .plus(liquidity || 0)
        .minus(borrow || 0)
        .toString(),
    [assets, borrow, liquidity],
  )

  const claimableRewards = useMemo(
    () =>
      Big(rewards.incentives.value || 0)
        .plus(rewards.farming.value || 0)
        .plus(referralUsd || 0)
        .toString(),
    [referralUsd, rewards.farming.value, rewards.incentives.value],
  )

  const isClaimableRewardsLoading = rewards.isLoading || referralPriceLoading

  const stats: Array<{
    label: string
    value: string
    isLoading: boolean
    cta?: ReactNode
    tooltip?: ReactNode
  }> = [
    {
      label: t("balances.header.netWorth"),
      value: t("common:currency", { value: netWorth }),
      isLoading: isAssetsLoading || isLiquidityLoading || isBorrowLoading,
    },
    {
      label: t("balances.header.assets"),
      value: t("common:currency", { value: assets }),
      isLoading: isAssetsLoading,
    },
    {
      label: t("myAssets.totalBorrow"),
      value: t("common:currency", { value: borrow }),
      isLoading: isBorrowLoading,
      tooltip: getMarketBreakdownTooltip(borrowByMarket),
    },
    {
      label: t("myAssets.totalSupply"),
      value: t("common:currency", { value: supply || 0 }),
      isLoading: isBorrowLoading,
      tooltip: getMarketBreakdownTooltip(supplyByMarket),
    },
    {
      label: t("balances.header.liquidity"),
      value: t("common:currency", { value: liquidity }),
      isLoading: isLiquidityLoading,
    },
    {
      label: t("myAssets.claimableRewards"),
      value: t("common:currency", { value: claimableRewards }),
      isLoading: isClaimableRewardsLoading,
      cta: (
        <Tooltip
          asChild
          side="top"
          align="end"
          text={!isMobileDevice() && <WalletRewardsBreakdownTooltipContent />}
        >
          <SPortfolioClaimButton
            disabled={
              isClaimableRewardsLoading || claimAll.isPending || rewards.isEmpty
            }
            onClick={() => claimAll.mutate()}
          >
            {t("myAssets.claim")}
          </SPortfolioClaimButton>
        </Tooltip>
      ),
    },
  ]

  const statsContent = (
    <SPortfolioOverviewStats
      separated={!isLg}
      gap="xxl"
      direction="row"
      justify="flex-start"
      py="m"
    >
      {stats.map(({ cta, tooltip, ...stat }, index) => {
        const isLast = index === stats.length - 1

        return (
          <Tooltip
            key={stat.label}
            asChild
            side="top"
            align="start"
            text={!isMobileDevice() && !stat.isLoading && tooltip}
          >
            <SPortfolioOverviewStat>
              {cta ? (
                <Flex
                  align="center"
                  justify={isLast ? "flex-end" : "flex-start"}
                  gap="base"
                  width="100%"
                >
                  <ValueStats
                    wrap
                    align={isLast ? "right" : "left"}
                    size="small"
                    label={stat.label}
                    value={stat.value}
                    isLoading={stat.isLoading}
                  />
                  {cta}
                </Flex>
              ) : (
                <ValueStats
                  wrap
                  size="small"
                  align={isLast ? "right" : "left"}
                  label={stat.label}
                  value={stat.value}
                  isLoading={stat.isLoading}
                />
              )}
            </SPortfolioOverviewStat>
          </Tooltip>
        )
      })}
    </SPortfolioOverviewStats>
  )

  return (
    <Box px="m">
      {isLg ? (
        statsContent
      ) : (
        <ScrollArea orientation="horizontal" horizontalEdgeOffset="m">
          {statsContent}
        </ScrollArea>
      )}
    </Box>
  )
})

PortfolioSummary.displayName = "PortfolioSummary"
