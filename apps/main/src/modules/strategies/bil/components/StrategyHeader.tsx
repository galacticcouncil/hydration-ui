import { useTranslation } from "react-i18next"

import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge"
import { StrategyHeader as SharedStrategyHeader } from "@/modules/strategies/components/StrategyHeader"

export const StrategyHeader = () => {
  const { t } = useTranslation("strategies")
  const { bil } = useBilStrategy()

  return (
    <SharedStrategyHeader
      logoId={bil.id}
      title={t("bil.strategy.name")}
      subtitle={bil.symbol}
      badges={[StrategyBadgeType.Partnership, StrategyBadgeType.RWA]}
    />
  )
}
