import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Status } from "@/modules/trade/orders/columns/SwapStatus"

type Props = {
  readonly status: DcaScheduleStatus
}

export const DcaOrderStatus: FC<Props> = ({ status }) => {
  const { t } = useTranslation("trade")

  switch (status) {
    case DcaScheduleStatus.Terminated:
      return (
        <Status color={getToken("accents.danger.secondary")}>
          {t("trade.orders.status.canceled")}
        </Status>
      )
    case DcaScheduleStatus.Created:
      return (
        <Status color={getToken("accents.success.emphasis")}>
          {t("trade.orders.status.active")}
        </Status>
      )
    default:
      return (
        <Status color={getToken("text.tint.quart")}>
          {t("trade.orders.status.filled")}
        </Status>
      )
  }
}
