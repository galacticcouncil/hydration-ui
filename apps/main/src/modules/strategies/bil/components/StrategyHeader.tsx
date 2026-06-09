import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { DecentralLogo } from "./DecentralLogo"

export const StrategyHeader = () => {
  const { t } = useTranslation("strategies")

  return (
    <Flex justify="space-between" align="center" gap="s">
      <Flex align="center" gap="base">
        <DecentralLogo size={32} />
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
          <Text fs="p5" color={getToken("text.medium")}>
            {t("bil.strategy.collateralAsset")}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
