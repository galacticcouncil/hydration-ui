import { formatAssetAmount } from "@galacticcouncil/utils"
import Big from "big.js"

import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { Papi } from "@/providers/rpcProvider"
import { scale } from "@/utils/formatting"

const FULL_ORDER_PCT_LBOUND = 99

export const getOtcFillOrderTx = (
  papi: Papi,
  otcOffer: OtcOffer,
  sellAmount: string,
) => {
  const filledPct = new Big(sellAmount)
    .div(otcOffer.assetAmountIn)
    .mul(100)
    .toNumber()

  return otcOffer.isPartiallyFillable && filledPct <= FULL_ORDER_PCT_LBOUND
    ? papi.tx.OTC.partial_fill_order({
        order_id: Number(otcOffer.id),
        amount_in: BigInt(scale(sellAmount, otcOffer.assetIn.decimals)),
      })
    : papi.tx.OTC.fill_order({
        order_id: Number(otcOffer.id),
      })
}

export const getOtcFeeMultiplier = (feePct: string) => {
  return Big(1).minus(feePct || 0)
}

export const getOtcBuyAmountAfterFee = (
  buyAmountBeforeFee: string,
  feePct: string,
) => {
  return Big(buyAmountBeforeFee).times(getOtcFeeMultiplier(feePct))
}

export const getOtcBuyAmountBeforeFee = (
  buyAmountAfterFee: string,
  feePct: string,
) => {
  return buyAmountAfterFee
    ? Big(buyAmountAfterFee).div(getOtcFeeMultiplier(feePct))
    : undefined
}

export const getOtcFeeAmount = (buyAmountAfterFee: string, feePct: string) => {
  const buyAmountBeforeFee = getOtcBuyAmountBeforeFee(buyAmountAfterFee, feePct)

  return buyAmountBeforeFee
    ? buyAmountBeforeFee.times(feePct).toString()
    : undefined
}

export const getOtcBuyAmountFromSellAmount = (
  order: OtcOffer | undefined,
  sellAmount: string,
  feePct: string,
) => {
  const sellAmountBig = Big(sellAmount || "0")

  if (!order || !sellAmountBig.gt(0)) return ""

  const ratio = Big(order.assetAmountIn).div(order.assetAmountOut)
  const buyAmountBeforeFee = sellAmountBig.div(ratio)

  return formatAssetAmount(
    getOtcBuyAmountAfterFee(buyAmountBeforeFee.toString(), feePct).toString(),
    order.assetOut.decimals,
  )
}

export const getOtcSellAmountFromBuyAmount = (
  order: OtcOffer,
  buyAmountAfterFee: string,
  feePct: string,
) => {
  const buyAmountBeforeFee = getOtcBuyAmountBeforeFee(buyAmountAfterFee, feePct)

  if (!buyAmountBeforeFee) return ""

  const ratio = Big(order.assetAmountIn).div(order.assetAmountOut)

  return formatAssetAmount(
    buyAmountBeforeFee.times(ratio).toString(),
    order.assetIn.decimals,
  )
}
