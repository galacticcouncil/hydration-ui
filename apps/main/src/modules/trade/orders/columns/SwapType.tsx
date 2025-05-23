import { Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export type SwapType = "market" | "dca"

type Props = {
  readonly type: SwapType
}

export const SwapType: FC<Props> = ({ type }) => {
  const { t } = useTranslation("trade")

  return (
    <Text fw={500} fs={12} lh={px(15)} color={getToken("text.high")}>
      {t(`trade.orders.type.${type}`)}
    </Text>
  )
}
