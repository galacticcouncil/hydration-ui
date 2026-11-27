import i18n from "@/i18n"
import { XcPayoutEvery } from "@/states/tradeSettings"

const ceilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b

export const getMinDelivery = ({
  payoutEvery,
  amountOut,
  tranches,
  routeMin,
}: {
  payoutEvery: number | "end"
  amountOut: bigint
  tranches: number
  routeMin: bigint
}) => {
  const batch =
    payoutEvery === "end" || tranches <= 0
      ? amountOut
      : (BigInt(payoutEvery) * amountOut) / BigInt(tranches)

  // xc-intents rejects minDelivery under routeMin (MinDeliveryBelowRouteMin),
  // including at the end and when an OrderTooSmall estimate gives amountOut 0
  return batch > routeMin ? batch : routeMin
}

export const getPayoutCount = (amountOut: bigint, minDelivery: bigint) =>
  minDelivery > 0n ? Number(ceilDiv(amountOut, minDelivery)) : 0

export const getYouReceive = (
  amount: bigint,
  payouts: number,
  payoutFee: bigint,
) => {
  const received = amount - BigInt(payouts) * payoutFee

  return received > 0n ? received : 0n
}

export const formatXcPayoutEvery = (payoutEvery: XcPayoutEvery) =>
  payoutEvery === "end"
    ? i18n.t("trade:xc.twap.payout.atEnd")
    : i18n.t("trade:xc.twap.payout.every", { count: payoutEvery })
