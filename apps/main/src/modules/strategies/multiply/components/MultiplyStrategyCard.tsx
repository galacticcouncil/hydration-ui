import { useTranslation } from "react-i18next"

import { ReserveApyProvider } from "@/modules/money-market/apy/ReserveApyProvider"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useMultiplyPairMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useAssets } from "@/providers/assetsProvider"

type MultiplyStrategyCardProps = {
  pair: MultiplyPair
}

const MultiplyStrategyCardContent: React.FC<MultiplyStrategyCardProps> = ({
  pair,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const { data, isLoading } = useMultiplyPairMetrics(pair)

  const collateral = getAssetWithFallback(pair.collateralAssetId).symbol
  const debt = getAssetWithFallback(pair.debtAssetId).symbol
  const maxLeverage = t("cards.multiply.leverage", {
    value: data?.maxLeverage ?? 0,
  })

  return (
    <StrategyCard
      logoId={pair.collateralAssetId}
      title={t("cards.multiply.title", { collateral, debt })}
      stats={[
        {
          label: t("cards.multiply.maxApy"),
          value:
            data && data.maxNetApy !== null
              ? t("common:percent", { value: data.maxNetApy * 100 })
              : "-",
          isLoading,
        },
        {
          label: t("cards.multiply.maxLeverage"),
          value: data ? maxLeverage : "-",
          isLoading: !data && isLoading,
        },
      ]}
      badges={[
        StrategyBadgeType.Leverage,
        ...(data?.unavailableReason ? [StrategyBadgeType.Unavailable] : []),
      ]}
      description={t("cards.multiply.description", {
        collateral,
        debt,
        max: data ? data.maxLeverage.toFixed(1) : "-",
      })}
      link="/strategies/multiply/$pairId"
      linkParams={{ pairId: pair.slug }}
    />
  )
}

export const MultiplyStrategyCard: React.FC<MultiplyStrategyCardProps> = ({
  pair,
}) => (
  <ReserveApyProvider>
    <MultiplyStrategyCardContent pair={pair} />
  </ReserveApyProvider>
)
