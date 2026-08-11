import {
  Box,
  Flex,
  ScrollArea,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { isMobileDevice } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalances.data"
import {
  SPortfolioClaimButton,
  SPortfolioOverviewStat,
  SPortfolioOverviewStats,
} from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"
import { WalletRewardsBreakdownTooltipContent } from "@/modules/wallet/assets/Rewards/WalletRewardsBreakdownTooltipContent"
import { useClaimAllWalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.claim"
import { useWalletRewardsSectionData } from "@/modules/wallet/assets/Rewards/WalletRewardsSection.data"

export const WalletPortfolioOverview: FC = () => {
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

  const stats = [
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
    },
    {
      label: t("myAssets.totalSupply"),
      value: t("common:currency", { value: supply || 0 }),
      isLoading: isBorrowLoading,
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
    <SPortfolioOverviewStats separated={!isLg} gap="xxl" direction="row" py="m">
      {stats.map(({ cta, ...stat }, index) => {
        const isLast = index === stats.length - 1

        return (
          <SPortfolioOverviewStat key={stat.label}>
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
}
