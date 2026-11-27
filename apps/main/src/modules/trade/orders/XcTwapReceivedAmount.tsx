import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { XcTwapOrderInfo } from "@/modules/trade/orders/lib/orderData"
import { useXcTwapScan } from "@/modules/trade/orders/lib/useXcTwapScan"
import { scaleHuman } from "@/utils/formatting"

type XcTwapReceivedAmountProps = {
  readonly xc: XcTwapOrderInfo
}

/** Paid out so far, plus what is bought but not yet paid out. */
export const XcTwapReceivedAmount: FC<XcTwapReceivedAmountProps> = ({ xc }) => {
  const { t } = useTranslation(["common", "trade"])
  const scan = useXcTwapScan(xc)
  const destination = xc.destination
  const trade = scan?.trade

  if (!destination) {
    return <Amount label={t("received")} value="-" />
  }

  const held = trade?.held ? BigInt(trade.held) : 0n

  return (
    <Amount
      label={t("received")}
      isLoading={!scan}
      value={
        trade
          ? t("currency", {
              value: scaleHuman(trade.received, destination.decimals),
              symbol: destination.symbol,
            })
          : destination.symbol
      }
      displayValue={
        held > 0n
          ? t("trade:trade.orders.xc.detail.awaitingPayout", {
              held: t("currency", {
                value: scaleHuman(held, destination.decimals),
                symbol: destination.symbol,
              }),
            })
          : undefined
      }
    />
  )
}
