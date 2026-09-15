import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { isValidBigSource } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { LimitOrderStatus } from "@/modules/trade/orders/columns/LimitOrderStatus"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import {
  isOrderStatus,
  OrderData,
  OrderKind,
  OrderStatus,
} from "@/modules/trade/orders/lib/orderData"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly from: TAsset
  readonly fromAmount: string | null
  readonly status: OrderStatus | "filled" | null | undefined
  readonly total?: string | null
  readonly isOpenBudget?: boolean
  readonly order?: OrderData
}

export const AmountMobile: FC<Props> = ({
  fromAmount,
  from,
  status,
  total,
  isOpenBudget,
  order,
}) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap="xs" align="end">
      <Text fw={600} fs="p5" lh={1} color={getToken("text.high")}>
        {isValidBigSource(fromAmount)
          ? t("currency", { value: fromAmount, symbol: from.symbol })
          : from.symbol}
      </Text>
      {status === "filled" && <SwapStatus />}
      {isOrderStatus(status) &&
        (order?.kind === OrderKind.Limit && status === OrderStatus.Created ? (
          <LimitOrderStatus order={order} />
        ) : (
          <DcaOrderStatus
            status={status}
            sold={fromAmount}
            total={total}
            isOpenBudget={isOpenBudget}
            from={from}
          />
        ))}
    </Flex>
  )
}
