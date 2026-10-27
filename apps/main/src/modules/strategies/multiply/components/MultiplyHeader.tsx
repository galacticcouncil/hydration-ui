import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  StrategyBadge,
  StrategyBadgeType,
} from "@/modules/strategies/components/StrategyBadge"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useAssets } from "@/providers/assetsProvider"

export const MultiplyHeader: React.FC<{ pair: MultiplyPair }> = ({ pair }) => {
  const { t } = useTranslation("strategies")
  const { getAssetWithFallback } = useAssets()
  const collateral = getAssetWithFallback(pair.collateralAssetId).symbol
  const debt = getAssetWithFallback(pair.debtAssetId).symbol

  return (
    <Flex justify="space-between" align="center" gap="s">
      <Flex align="center" gap="base">
        <AssetLogo id={pair.collateralAssetId} size="large" />
        <Flex direction="column">
          <Text
            font="primary"
            fs="h6"
            lh={1}
            fw={600}
            color={getToken("text.high")}
          >
            {t("cards.multiply.title", { collateral, debt })}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("multiply.subtitle", { collateral, debt })}
          </Text>
        </Flex>
      </Flex>
      <StrategyBadge type={StrategyBadgeType.Leverage} />
    </Flex>
  )
}
