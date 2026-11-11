import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  StrategyBadge,
  StrategyBadgeType,
} from "@/modules/strategies/components/StrategyBadge"
import { MultiplyLogo } from "@/modules/strategies/multiply/components/MultiplyLogo"

export const MultiplyHeader: React.FC = () => {
  const { t } = useTranslation("strategies")

  return (
    <Flex justify="space-between" align="center" gap="s">
      <Flex align="center" gap="base">
        <MultiplyLogo size="large" />
        <Text
          font="primary"
          fs="h6"
          lh={1}
          fw={600}
          color={getToken("text.high")}
        >
          {t("multiply.name")}
        </Text>
      </Flex>
      <StrategyBadge type={StrategyBadgeType.Leverage} />
    </Flex>
  )
}
