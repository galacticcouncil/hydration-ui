import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { AssetLogo } from "@/components/AssetLogo"
import { LINKS } from "@/config/navigation"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge/StrategyBadge"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"
import { usePropellerVaults } from "@/modules/strategies/propeller/hooks/usePropellerVaults"

export const PropellerStrategyCard = () => {
  const { t } = useTranslation(["common", "strategies", "propeller"])
  const { vaults, upToApy, subLoop, isLoading } = usePropellerVaults()
  const leverage = subLoop?.leverage

  return (
    <StrategyCard
      logo={
        <AssetLogo
          id={vaults.map(({ vault }) => vault.assetId)}
          size="extra-large"
          hideChain
        />
      }
      title={t("strategies:cards.propeller.title")}
      description={t("strategies:cards.propeller.description")}
      stats={[
        {
          label: t("propeller:strategy.upToApy"),
          value:
            upToApy !== null ? t("common:percent", { value: upToApy }) : "-",
          isLoading,
        },
        ...(isNullish(leverage)
          ? []
          : [
              {
                label: t("propeller:strategy.loopLeverage"),
                value: t("propeller:strategy.loopLeverageValue", {
                  value: leverage,
                }),
                isLoading,
              },
            ]),
      ]}
      badges={[StrategyBadgeType.Leverage, StrategyBadgeType.NoLiquidation]}
      link={LINKS.strategiesPropeller}
    />
  )
}
