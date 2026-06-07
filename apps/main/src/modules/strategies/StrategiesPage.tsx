import { Grid, SectionHeader } from "@galacticcouncil/ui/components"
import { HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { ETH_ASSET_ID } from "@/modules/strategies/propeller/constants"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useRpcProvider } from "@/providers/rpcProvider"

export const StrategiesPage = () => {
  const { t } = useTranslation(["common", "strategies"])
  const { featureFlags } = useRpcProvider()
  const bondId = HOLLAR_BOND_25_08_26_ID
  const { timeLeft } = useBondData(bondId)
  const bondApr = getBondApr(bondId, timeLeft)

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
            { label: t("apy"), value: t("common:percent", { value: 4.5 }) },
          ]}
          badges={[
            { label: "Partnership", variant: "green" },
            { label: "RWA", variant: "purple" },
          ]}
          description={t("strategies:cards.hdcl.description")}
          link={LINKS.strategiesHdcl}
        />
        <StrategyCard
          logoId={ETH_ASSET_ID}
          title={t("strategies:cards.propeller.title")}
          stats={[
            { label: t("apy"), value: t("common:percent", { value: 12 }) },
          ]}
          badges={[
            { label: "Leverage", variant: "accent" },
            { label: "No liquidation", variant: "green" },
          ]}
          description={t("strategies:cards.propeller.description")}
          link={LINKS.strategiesPropeller}
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
            badges={[{ label: "Fixed Yield", variant: "info" }]}
            description={t("strategies:cards.hollarBonds.description")}
            link={LINKS.strategiesHollarBonds}
          />
        )}
      </Grid>
    </>
  )
}
