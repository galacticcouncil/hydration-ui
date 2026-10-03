import { useTranslation } from "react-i18next"

import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge"
import { StrategyHeader as SharedStrategyHeader } from "@/modules/strategies/components/StrategyHeader"
import { JuicerStrategyLogo } from "@/modules/strategies/propeller/components/JuicerStrategyLogo"

export const StrategyHeader = () => {
  const { t } = useTranslation("propeller")

  return (
    <SharedStrategyHeader
      logo={<JuicerStrategyLogo size="large" />}
      title={t("strategy.name")}
      badges={[StrategyBadgeType.Leverage, StrategyBadgeType.NoLiquidation]}
    />
  )
}
