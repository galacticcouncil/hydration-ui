import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { BIL_ERC20_ID, HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { useBilStrategyMetrics } from "@/modules/strategies/bil/hooks/useBilStrategyMetrics"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useRpcProvider } from "@/providers/rpcProvider"

export const StrategiesPage = () => {
  const { t } = useTranslation(["common", "strategies"])
  const { featureFlags } = useRpcProvider()
  const bondId = HOLLAR_BOND_25_08_26_ID
  const { timeLeft } = useBondData(bondId)
  const bondApr = getBondApr(bondId, timeLeft)

  const { data: bilMetrics, isLoading: isBilMetricsLoading } =
    useBilStrategyMetrics()

  return (
    <>
      <SectionHeader title={t("strategies:page.title")} noTopPadding />
      <Grid
        columnTemplate={["1fr", null, "repeat(2, 1fr)", null, "repeat(4, 1fr)"]}
        gap="xl"
      >
        {featureFlags.bilEnabled && (
          <StrategyCard
            logoId={BIL_ERC20_ID}
            title={t("strategies:cards.bil.title")}
            stats={[
              {
                label: t("apy"),
                value: t("common:percent", { value: bilMetrics.maxNetApyPct }),
                isLoading: isBilMetricsLoading,
              },
            ]}
            badges={[StrategyBadgeType.Partnership, StrategyBadgeType.RWA]}
            description={t("strategies:cards.bil.description")}
            link={LINKS.strategiesBil}
          />
        )}
        {featureFlags.hollarBondsEnabled && (
          <StrategyCard
            logoId={bondId}
            title={t("strategies:cards.hollarBonds.title")}
            stats={[
              {
                label: t("apr"),
                value:
                  bondApr !== null
                    ? t("common:percent", {
                        value: bondApr,
                      })
                    : "-",
              },
            ]}
            badges={[StrategyBadgeType.FixedYield]}
            description={t("strategies:cards.hollarBonds.description")}
            link={LINKS.strategiesHollarBonds}
          />
        )}
      </Grid>
    </>
  )
}
