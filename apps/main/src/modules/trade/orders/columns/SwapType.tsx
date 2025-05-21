import { Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OrderKind } from "@/modules/trade/orders/lib/useOrdersData"

type Props = {
  readonly type: OrderKind | "market"
}

export const SwapType: FC<Props> = ({ type }) => {
  const { t } = useTranslation("trade")

  return (
    <Text fw={500} fs={12} lh={px(15)} color={getToken("text.high")}>
      {t(`trade.orders.type.${type}`)}
    </Text>
  )
}
