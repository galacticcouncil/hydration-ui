import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"

export const StrategyHeader = () => {
  const { t } = useTranslation("strategies")
  const { bilReserve } = useBilStrategy()

  return (
    <Flex justify="space-between" align="center" gap="s">
      <Flex align="center" gap="base">
        <AssetLogo id={bilReserve.id} size="large" />
        <Flex direction="column">
          <Text
            font="primary"
            fs="h6"
            lh={1}
            fw={600}
            color={getToken("text.high")}
          >
            {t("bil.strategy.name")}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
