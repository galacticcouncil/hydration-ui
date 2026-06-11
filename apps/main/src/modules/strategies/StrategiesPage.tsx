import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { useHdclStrategyMetrics } from "@/modules/strategies/hdcl/hooks/useHdclStrategyMetrics"
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
  // live net carry per collateral; null until positive. All vaults share one
  // Propeller subpage, so the overview shows a single card with the best (highest)
  // available carry across collaterals as the headline APY.
  const ethApy = usePropellerApy(PROPELLER_VAULTS.eth)
  const tbtcApy = usePropellerApy(PROPELLER_VAULTS.tbtc)
  const propellerApys = [ethApy, tbtcApy].filter((a): a is number => a !== null)
  const propellerApy = propellerApys.length ? Math.max(...propellerApys) : null

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
          logoId="decentral"
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
        <StrategyCard
          logoId="propeller"
          title={t("strategies:cards.propeller.title")}
          stats={[
            // best live net APY across collaterals; "-" until a carry is positive.
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
