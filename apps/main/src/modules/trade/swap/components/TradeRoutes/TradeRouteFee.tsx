import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetsPrice } from "@/components/AssetPrice"
import { TradeRouteFee as TradeRouteFeeModel } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes.utils"

type Props = {
  readonly feePct: string
  readonly fees: ReadonlyArray<TradeRouteFeeModel>
}

export const TradeRouteFee: FC<Props> = ({ feePct, fees }) => {
  const { t } = useTranslation(["common"])
  const [tradeFeeDisplay] = useDisplayAssetsPrice(
    fees.map((fee) => [fee.asset.id, fee.value] as const),
    { maximumFractionDigits: null },
  )

  return (
    <Flex direction="column" gap="xs" align="flex-end">
      <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
        {tradeFeeDisplay}
      </Text>
      <Text fw={500} fs="p6" lh={1.2} color={getToken("text.low")}>
        {t("percent", { value: feePct })}
      </Text>
    </Flex>
  )
}
