import { Infinity } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OrderKind } from "@/modules/trade/orders/lib/useOrdersData"

type Props = {
  readonly type: OrderKind | "market"
}

export const SwapType: FC<Props> = ({ type }) => {
  const { t } = useTranslation("trade")

  return (
    <Flex align="center" gap={2}>
      {type === OrderKind.DcaRolling && (
        <Icon
          component={Infinity}
          size={14}
          color={getToken("icons.primary")}
        />
      )}
      <Text fw={500} fs="p5" lh="s" color={getToken("text.high")}>
        {type === OrderKind.DcaRolling
          ? t("trade.orders.type.dca")
          : t(`trade.orders.type.${type}`)}
      </Text>
    </Flex>
  )
}
