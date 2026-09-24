import { useTranslation } from "react-i18next"

import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge"
import { StrategyHeader as SharedStrategyHeader } from "@/modules/strategies/components/StrategyHeader"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"

const VAULT_ASSET_IDS = PROPELLER_VAULTS.map(({ assetId }) => assetId)

export const StrategyHeader = () => {
  const { t } = useTranslation("propeller")

  return (
    <SharedStrategyHeader
      logoId={VAULT_ASSET_IDS}
      title={t("strategy.name")}
      badges={[StrategyBadgeType.Leverage, StrategyBadgeType.NoLiquidation]}
    />
  )
}
