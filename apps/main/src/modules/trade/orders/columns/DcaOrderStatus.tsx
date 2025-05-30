import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DcaScheduleStatus } from "@/api/graphql/trade-orders"
import { Status } from "@/modules/trade/orders/columns/SwapStatus"

type Props = {
  readonly status: DcaScheduleStatus
}

export const DcaOrderStatus: FC<Props> = ({ status }) => {
  const { t } = useTranslation("trade")

  switch (status) {
    case DcaScheduleStatus.Terminated:
      return (
        <Status color={getToken("colors.utility.red.400")}>
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
      return <Status color="#AAEEFC">{t("trade.orders.status.filled")}</Status>
  }
}
