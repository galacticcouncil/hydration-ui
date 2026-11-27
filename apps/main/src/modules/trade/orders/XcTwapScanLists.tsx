import { Flex, Separator } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { XcScanOrder } from "@/api/xcIntents"
import { XcTwapOrderInfo } from "@/modules/trade/orders/lib/orderData"
import { useXcTwapTradeQuery } from "@/modules/trade/orders/lib/useXcTwapScan"
import { getXcOrderTxLink } from "@/modules/trade/orders/lib/xcTwap"
import { XcTwapPayoutRow } from "@/modules/trade/orders/XcTwapPayoutRow"
import { XcTwapScanList } from "@/modules/trade/orders/XcTwapScanList"
import { XcTwapScanRow } from "@/modules/trade/orders/XcTwapScanRow"
import { scaleHuman } from "@/utils/formatting"

const ORDER_STATE_KEYS = {
  published: "trade.orders.xc.detail.sent",
  forwarded: "trade.orders.xc.detail.bridged",
  swapped: "trade.orders.xc.detail.swapped",
} as const satisfies Record<XcScanOrder["state"], string>

type XcTwapScanListsProps = {
  readonly xc: XcTwapOrderInfo
}

/** Replaces past executions for xc TWAPs: scan's orders and payouts. */
export const XcTwapScanLists: FC<XcTwapScanListsProps> = ({ xc }) => {
  const { t } = useTranslation(["common", "trade"])
  const { data, isError, isLoading } = useXcTwapTradeQuery(xc)

  if (data === null) return null

  const isUnavailable = !data && isError
  const orders = data?.orders ?? []
  const payouts = data?.payouts ?? []

  return (
    <Flex
      direction="column"
      overflow="hidden"
      bg={getToken("surfaces.containers.dim.dimOnBg")}
      sx={{
        marginInline: "var(--modal-content-inset)",
        marginBottom: "var(--modal-content-inset)",
        borderBottomLeftRadius: "xl",
        borderBottomRightRadius: "xl",
      }}
    >
      <XcTwapScanList
        title={t("trade:trade.orders.xc.detail.orders")}
        items={orders}
        isLoading={isLoading}
        isUnavailable={isUnavailable}
        renderItem={(order) => (
          <XcTwapScanRow
            amount={
              order.amount_in && order.asset_in_meta
                ? t("currency", {
                    value: scaleHuman(
                      order.amount_in,
                      order.asset_in_meta.decimals,
                    ),
                    symbol: order.asset_in_meta.symbol,
                  })
                : null
            }
            timestamp={order.published?.blockTimestamp ?? null}
            state={t(`trade:${ORDER_STATE_KEYS[order.state]}`)}
            isStateSuccess={order.state === "swapped"}
            link={getXcOrderTxLink(order)}
          />
        )}
      />
      <Separator />
      <XcTwapScanList
        title={t("trade:trade.orders.xc.detail.payouts")}
        items={payouts}
        isLoading={isLoading}
        isUnavailable={isUnavailable}
        renderItem={(payout) => (
          <XcTwapPayoutRow
            payout={payout}
            xc={xc}
            destinationAsset={data?.trade.destination_asset ?? ""}
          />
        )}
      />
    </Flex>
  )
}
