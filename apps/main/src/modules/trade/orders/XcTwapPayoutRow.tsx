import { FC } from "react"
import { useTranslation } from "react-i18next"

import { XcScanPayout } from "@/api/xcIntents"
import { XcTwapOrderInfo } from "@/modules/trade/orders/lib/orderData"
import {
  getXcPayoutAmount,
  getXcPayoutTxLink,
} from "@/modules/trade/orders/lib/xcTwap"
import { XcTwapScanRow } from "@/modules/trade/orders/XcTwapScanRow"

type XcTwapPayoutRowProps = {
  readonly payout: XcScanPayout
  readonly xc: XcTwapOrderInfo
  readonly destinationAsset: string
}

export const XcTwapPayoutRow: FC<XcTwapPayoutRowProps> = ({
  payout,
  xc,
  destinationAsset,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const amount = getXcPayoutAmount(payout, xc.destination)

  let state: string | null = null
  if (payout.state === "refunded") {
    state = t("trade:trade.orders.status.refunded")
  } else if (!payout.dest_at) {
    state = t("pending")
  }

  return (
    <XcTwapScanRow
      amount={amount ? t("currency", amount) : null}
      timestamp={
        payout.dest_at
          ? Number(payout.dest_at)
          : (payout.signed?.blockTimestamp ?? null)
      }
      state={state}
      link={getXcPayoutTxLink(destinationAsset, payout)}
    />
  )
}
