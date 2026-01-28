import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

type Props = {
  readonly assetId: string
  readonly assetSymbol: string
  readonly amount: string
}

export const TradeRouteAsset: FC<Props> = ({
  assetId,
  assetSymbol,
  amount,
}) => {
  const { t } = useTranslation(["common"])

  return (
    <Flex align="center" gap="s">
      <AssetLogo id={assetId} size="medium" />
      <Flex direction="column">
        <Text
          fw={500}
          fs="p3"
          lh={1.2}
          color={getToken("text.high")}
          whiteSpace="nowrap"
        >
          {assetSymbol}
        </Text>
        <Text
          fw={500}
          fs="p6"
          lh={1.2}
          color={getToken("text.low")}
          whiteSpace="nowrap"
        >
          {t("number", { value: amount })}
        </Text>
      </Flex>
    </Flex>
  )
}
