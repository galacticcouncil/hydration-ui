import { FC } from "react"
import { useTranslation } from "react-i18next"

import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge"
import { StrategyHeader as SharedStrategyHeader } from "@/modules/strategies/components/StrategyHeader"
import { JuicerStrategyLogo } from "@/modules/strategies/juicer/components/JuicerStrategyLogo"

export const StrategyHeader: FC = () => {
  const { t } = useTranslation(["juicer", "common"])

  return (
    <SharedStrategyHeader
      logo={<JuicerStrategyLogo size="large" />}
      title={t("strategy.name")}
      subtitle={t("common:navigation.strategiesJuicer.description")}
      badges={[StrategyBadgeType.Leverage, StrategyBadgeType.OneToOneExposure]}
    />
  )
}
