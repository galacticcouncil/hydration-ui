import { useTranslation } from "react-i18next"

import { ReserveApyProvider } from "@/modules/money-market/apy/ReserveApyProvider"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { MultiplyLogo } from "@/modules/strategies/multiply/components/MultiplyLogo"
import { useMultiplyPairsMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"

const best = (values: (number | null | undefined)[]) => {
  const known = values.filter((v): v is number => v !== null && v !== undefined)
  return known.length ? Math.max(...known) : null
}

const MultiplyStrategyCardContent: React.FC = () => {
  const { t } = useTranslation(["strategies", "common"])
  const pairs = useMultiplyPairsMetrics()

  const isLoading = pairs.some((p) => p.isLoading)
  const maxApy = best(pairs.map((p) => p.data?.maxNetApy))
  const maxLeverage = best(pairs.map((p) => p.data?.maxLeverage))

  return (
    <StrategyCard
      logo={<MultiplyLogo size="extra-large" />}
      title={t("multiply.name")}
      stats={[
        {
          label: t("cards.multiply.upToApy"),
          value:
            maxApy !== null
              ? t("common:percent", { value: maxApy * 100 })
              : "-",
          isLoading: maxApy === null && isLoading,
        },
        {
          label: t("cards.multiply.upToLeverage"),
          value:
            maxLeverage !== null
              ? t("cards.multiply.leverage", { value: maxLeverage })
              : "-",
          isLoading: maxLeverage === null && isLoading,
        },
      ]}
      badges={[StrategyBadgeType.Leverage]}
      description={t("cards.multiply.description")}
      link="/strategies/looper"
    />
  )
}

export const MultiplyStrategyCard: React.FC = () => (
  <ReserveApyProvider>
    <MultiplyStrategyCardContent />
  </ReserveApyProvider>
)
