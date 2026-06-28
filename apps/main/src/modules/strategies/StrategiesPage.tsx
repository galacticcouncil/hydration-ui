import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { DCL_ASSET_ID, HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { useHdclStrategyMetrics } from "@/modules/strategies/hdcl/hooks/useHdclStrategyMetrics"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useRpcProvider } from "@/providers/rpcProvider"

export const StrategiesPage = () => {
  const { t } = useTranslation(["common", "strategies"])
  const { featureFlags } = useRpcProvider()
  const bondId = HOLLAR_BOND_25_08_26_ID
  const { timeLeft } = useBondData(bondId)
  const bondApr = getBondApr(bondId, timeLeft)

  const { data: hdclMetrics, isLoading: isHdclMetricsLoading } =
    useHdclStrategyMetrics()

  return (
    <>
      <SectionHeader title="Strategies" noTopPadding />
      <Grid
        columnTemplate={["1fr", null, "repeat(2, 1fr)", null, "repeat(4, 1fr)"]}
        gap="xl"
      >
        <StrategyCard
          logoId={DCL_ASSET_ID}
          title={t("strategies:cards.hdcl.title")}
          stats={[
            {
              label: t("apy"),
              value: t("common:percent", { value: hdclMetrics.maxNetApyPct }),
              isLoading: isHdclMetricsLoading,
            },
          ]}
          badges={[StrategyBadgeType.Partnership, StrategyBadgeType.RWA]}
          description={t("strategies:cards.hdcl.description")}
          link={LINKS.strategiesHdcl}
        />
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
                        minimumFractionDigits: 2,
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
