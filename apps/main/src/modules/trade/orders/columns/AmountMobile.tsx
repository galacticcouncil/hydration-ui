import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  DcaScheduleStatus,
  isDcaScheduleStatus,
} from "@/api/graphql/trade-orders"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly from: TAsset
  readonly fromAmount: string
  readonly status: DcaScheduleStatus | "filled" | null | undefined
}

export const AmountMobile: FC<Props> = ({ fromAmount, from, status }) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap={2} align="end">
      <Text fw={600} fs="p5" lh={1} color={getToken("text.high")}>
        {t("currency", { value: fromAmount, symbol: from.symbol })}
      </Text>
      {status === "filled" && <SwapStatus />}
      {isDcaScheduleStatus(status) && <DcaOrderStatus status={status} />}
    </Flex>
  )
}
