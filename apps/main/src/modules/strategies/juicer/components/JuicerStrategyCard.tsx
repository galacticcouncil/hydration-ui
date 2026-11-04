import { FC } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { JuicerStrategyLogo } from "@/modules/strategies/juicer/components/JuicerStrategyLogo"
import { useJuicerVaults } from "@/modules/strategies/juicer/hooks/useJuicerVaults"

export const JuicerStrategyCard: FC = () => {
  const { t } = useTranslation(["common", "strategies", "juicer"])
  const { upToApy, totalTvlUsd, isLoading } = useJuicerVaults()
  const yieldValue =
    upToApy !== null ? t("common:percent", { value: upToApy }) : "-"

  return (
    <StrategyCard
      logo={<JuicerStrategyLogo size="extra-large" />}
      title={t("strategies:cards.juicer.title")}
      description={t("strategies:cards.juicer.description")}
      stats={[
        {
          label: t("juicer:strategy.upToApy"),
          value: yieldValue,
          valueTone: "yield",
          isLoading,
        },
        {
          label: t("strategies:bil.strategy.tvl"),
          value: t("common:currency.compact", { value: totalTvlUsd }),
          isLoading,
        },
      ]}
      badges={[StrategyBadgeType.Leverage, StrategyBadgeType.OneToOneExposure]}
      link={LINKS.strategiesJuicer}
    />
  )
}
