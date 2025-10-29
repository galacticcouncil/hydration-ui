import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"

type Props = {
  readonly assetId: string
  readonly tradeFee: string
  readonly tradeFeePct: number
}

export const TradeRouteFee: FC<Props> = ({
  assetId,
  tradeFeePct,
  tradeFee,
}) => {
  const { t } = useTranslation(["common"])

  const [tradeFeeDisplay] = useDisplayAssetPrice(assetId, tradeFee)

  return (
    <Flex direction="column" gap={2} align="flex-end">
      <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
        {t("percent", { value: tradeFeePct })}
      </Text>
      <Text fw={500} fs="p6" lh={1.2} color={getToken("text.low")}>
        {tradeFeeDisplay}
      </Text>
    </Flex>
  )
}
