import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { Status } from "@/modules/trade/orders/columns/SwapStatus"
import {
  OrderData,
  OrderStatus,
  XcTwapOrderInfo,
} from "@/modules/trade/orders/lib/orderData"
import { useXcTwapScan } from "@/modules/trade/orders/lib/useXcTwapScan"
import { getXcTwapStatus } from "@/modules/trade/orders/lib/xcTwapStatus"

type XcTwapStatusProps = {
  readonly order: OrderData
  readonly xc: XcTwapOrderInfo
  /** Today's chain / neckwork status, kept for Active and when scan has nothing */
  readonly fallback: ReactNode
  readonly align?: "start" | "end"
}

export const XcTwapStatus: FC<XcTwapStatusProps> = ({
  order,
  xc,
  fallback,
  align = "start",
}) => {
  const { t } = useTranslation(["trade", "common"])
  const scan = useXcTwapScan(xc)

  if (!scan) return fallback

  const status = getXcTwapStatus({
    scanStatus: scan.state,
    intentLive: order.status === OrderStatus.Created,
    held: scan.trade?.held,
  })

  const withSubLabel = (label: ReactNode, subLabel: string | null) => (
    <Flex direction="column" gap="xs" align={align}>
      {label}
      {subLabel && (
        <Text fs="p6" lh={1} color={getToken("text.low")}>
          {subLabel}
        </Text>
      )}
    </Flex>
  )

  switch (status) {
    case "active":
      return fallback
    case "waitingFirstOrder":
      return withSubLabel(
        fallback,
        t("trade.orders.xc.status.waitingFirstOrder"),
      )
    case "unavailable":
      return withSubLabel(
        fallback,
        t("trade.orders.xc.status.detailsUnavailable"),
      )
    case "payingOut":
      return (
        <Status color={getToken("accents.success.emphasis")}>
          {t("trade.orders.xc.status.payingOut")}
        </Status>
      )
    case "cancelling": {
      const settleAt = scan.trade?.settle_at
      return withSubLabel(
        <Status color={getToken("text.medium")}>
          {t("trade.orders.xc.status.cancelling")}
        </Status>,
        settleAt
          ? t("trade.orders.xc.status.settlesAt", {
              value: new Date(Number(settleAt) * 1000),
            })
          : null,
      )
    }
    case "completed":
      return (
        <Status color={getToken("text.tint.quart")}>
          {t("trade.orders.status.completed")}
        </Status>
      )
    case "refunded":
      return (
        <Status color={getToken("text.low")}>
          {t("trade.orders.status.refunded")}
        </Status>
      )
    case "expired":
      return (
        <Status color={getToken("text.low")}>
          {t("trade.orders.status.expired")}
        </Status>
      )
  }
}
