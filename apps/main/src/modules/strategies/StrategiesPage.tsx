import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { BIL_ASSET_ID, HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { useBilStrategyMetrics } from "@/modules/strategies/bil/hooks/useBilStrategyMetrics"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { usePropellerApy } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/vaults"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useRpcProvider } from "@/providers/rpcProvider"

export const StrategiesPage = () => {
  const { t } = useTranslation(["common", "strategies"])
  const { featureFlags } = useRpcProvider()
  const bondId = HOLLAR_BOND_25_08_26_ID
  const { timeLeft } = useBondData(bondId)
  const bondApr = getBondApr(bondId, timeLeft)
  const ethApy = usePropellerApy(PROPELLER_VAULTS.eth)
  const tbtcApy = usePropellerApy(PROPELLER_VAULTS.tbtc)
  const propellerApys = [ethApy, tbtcApy].filter((a): a is number => a !== null)
  const propellerApy = propellerApys.length ? Math.max(...propellerApys) : null

  const { data: bilMetrics, isLoading: isBilMetricsLoading } =
    useBilStrategyMetrics()

  return (
    <>
      <SectionHeader title="Strategies" noTopPadding />
      <Grid
        columnTemplate={["1fr", null, "repeat(2, 1fr)", null, "repeat(4, 1fr)"]}
        gap="xl"
      >
        <StrategyCard
          logoId={BIL_ASSET_ID}
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
        <StrategyCard
          logoId="propeller"
          title={t("strategies:cards.propeller.title")}
          stats={[
            {
              label: t("apy"),
              value:
                propellerApy !== null
                  ? t("common:percent", { value: propellerApy })
                  : "-",
            },
          ]}
          badges={[StrategyBadgeType.Leverage, StrategyBadgeType.NoLiquidation]}
          description={t("strategies:cards.propeller.description")}
          link="/strategies/propeller"
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
