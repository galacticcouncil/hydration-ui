import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { DCL_ASSET_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

export const StrategyHeader = () => {
  const { t } = useTranslation("strategies")

  return (
    <Flex justify="space-between" align="center" gap="s">
      <Flex align="center" gap="base">
        <AssetLogo id={DCL_ASSET_ID} size="large" />
        <Flex direction="column">
          <Text
            font="primary"
            fs="h6"
            lh={1}
            fw={600}
            color={getToken("text.high")}
          >
            {t("hdcl.strategy.name")}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("hdcl.strategy.collateralAsset")}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
