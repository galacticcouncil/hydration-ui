import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { LINKS } from "@/config/navigation"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { JuicerStrategyLogo } from "@/modules/strategies/propeller/components/JuicerStrategyLogo"
import { usePropellerVaults } from "@/modules/strategies/propeller/hooks/usePropellerVaults"

export const PropellerStrategyCard = () => {
  const { t } = useTranslation(["common", "strategies", "propeller"])
  const { upToApy, subLoop, isLoading } = usePropellerVaults()
  const leverage = subLoop?.leverage
  const yieldValue =
    upToApy !== null ? t("common:percent", { value: upToApy }) : "-"
  const leverageValue = isNullish(leverage)
    ? null
    : t("propeller:strategy.loopLeverageValue", { value: leverage })

  return (
    <StrategyCard
      logo={<JuicerStrategyLogo size="extra-large" />}
      title={t("strategies:cards.propeller.title")}
      description={t("strategies:cards.propeller.description")}
      stats={[
        {
          label: t("propeller:strategy.upToApy"),
          value: yieldValue,
          valueTone: "yield",
          isLoading,
        },
        ...(leverageValue === null
          ? []
          : [
              {
                label: t("propeller:strategy.loopLeverage"),
                value: leverageValue,
                isLoading,
              },
            ]),
      ]}
      badges={[StrategyBadgeType.Leverage, StrategyBadgeType.NoLiquidation]}
      link={LINKS.strategiesJuicer}
    />
  )
}
