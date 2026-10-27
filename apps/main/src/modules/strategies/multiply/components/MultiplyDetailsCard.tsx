import {
  Box,
  Flex,
  Grid,
  Paper,
  ResponsiveScope,
  Separator,
  Summary,
  SummaryRow,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SDetailsStatItem,
  SDetailsStatsContainer,
  SDetailsStatsSeparator,
} from "@/modules/strategies/bil/components/StrategyDetailsCard.styled"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { type MultiplyPairMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useAssets } from "@/providers/assetsProvider"

type MultiplyDetailsCardProps = {
  pair: MultiplyPair
  metrics: MultiplyPairMetrics
  isLoading: boolean
}

export const MultiplyDetailsCard: React.FC<MultiplyDetailsCardProps> = ({
  pair,
  metrics,
  isLoading,
}) => {
  const { t } = useTranslation(["strategies", "borrow", "common"])
  const { getAssetWithFallback } = useAssets()
  const collateral = getAssetWithFallback(pair.collateralAssetId)
  const debt = getAssetWithFallback(pair.debtAssetId)
  //const feeAsset = getAssetWithFallback(pair.feeAssetId)

  const percent = (fraction: number | null) =>
    fraction === null ? "-" : t("common:percent", { value: fraction * 100 })

  const stats = [
    {
      label: t("cards.multiply.maxApy"),
      value: percent(metrics.maxNetApy),
      color: getToken("accents.success.emphasis"),
    },
    {
      label: t("cards.multiply.maxLeverage"),
      value: t("cards.multiply.leverage", { value: metrics.maxLeverage }),
    },
    {
      label: t("multiply.details.supplyApy", { symbol: collateral.symbol }),
      value: percent(metrics.supplyApy),
    },
    {
      label: t("multiply.details.borrowApy", { symbol: debt.symbol }),
      value: percent(metrics.borrowApy),
    },
  ]

  const assetRow = (label: string, id: string, symbol: string) => (
    <SummaryRow
      label={label}
      content={
        <Flex align="center" gap="s">
          <AssetLogo id={id} size="extra-small" />
          <Text fs="p5" lh={1.5}>
            {symbol}
          </Text>
        </Flex>
      }
    />
  )

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("details.title")}
        </Text>
      </Box>
      <Separator />

      <ResponsiveScope>
        <SDetailsStatsContainer>
          {stats.map((stat, index) => (
            <Flex key={stat.label} sx={{ display: "contents" }}>
              {index > 0 && <SDetailsStatsSeparator />}
              <SDetailsStatItem>
                <ValueStats
                  wrap
                  isLoading={isLoading}
                  label={stat.label}
                  customValue={
                    <Text
                      font="primary"
                      fs="h6"
                      fw={600}
                      color={stat.color ?? getToken("text.high")}
                    >
                      {stat.value}
                    </Text>
                  }
                />
              </SDetailsStatItem>
            </Flex>
          ))}
        </SDetailsStatsContainer>
      </ResponsiveScope>

      <Separator />

      <Grid columnGap="l" columnTemplate={["1fr", null, null, "1fr 1fr"]} p="l">
        <Summary withTrailingSeparator justify="flex-start">
          {assetRow(
            t("multiply.details.collateral"),
            collateral.id,
            collateral.symbol,
          )}
          {assetRow(t("multiply.details.debt"), debt.id, debt.symbol)}
          {/* {assetRow(
            t("multiply.details.feeAsset"),
            feeAsset.id,
            feeAsset.symbol,
          )} */}
        </Summary>
        <Summary withTrailingSeparator justify="flex-start">
          <SummaryRow
            label={t("borrow:summary.maxLtv")}
            content={percent(metrics.ltv)}
          />
          <SummaryRow
            label={t("multiply.details.liquidationThreshold")}
            content={percent(metrics.lt)}
          />
          {/*  <SummaryRow
            label={t("multiply.details.minHf")}
            content={t("common:number", { value: metrics.minHf })}
          /> */}
        </Summary>
      </Grid>
    </Paper>
  )
}
