import { formatAssetAmount } from "@galacticcouncil/utils"
import Big from "big.js"

import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"

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
