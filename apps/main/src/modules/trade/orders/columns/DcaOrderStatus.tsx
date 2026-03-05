import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Status, SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"

type Props = {
  readonly status: DcaScheduleStatus
  readonly isDcaSwap?: boolean
}

export const DcaOrderStatus: FC<Props> = ({ status, isDcaSwap = false }) => {
  const { t } = useTranslation("trade")

  switch (status) {
    case DcaScheduleStatus.Terminated:
      return (
        <Status color={getToken("accents.danger.secondary")}>
          {t("trade.orders.status.failed")}
        </Status>
      )
    case DcaScheduleStatus.Cancelled:
      return (
        <Status color={getToken("accents.danger.secondary")}>
          {t("trade.orders.status.cancelled")}
        </Status>
      )
    case DcaScheduleStatus.Created:
      return isDcaSwap ? (
        <SwapStatus />
      ) : (
        <Status color={getToken("accents.success.emphasis")}>
          {t("trade.orders.status.active")}
        </Status>
      )
    default:
      return isDcaSwap ? (
        <SwapStatus />
      ) : (
        <Status color={getToken("text.tint.quart")}>
          {t("trade.orders.status.completed")}
        </Status>
      )
  }
}
