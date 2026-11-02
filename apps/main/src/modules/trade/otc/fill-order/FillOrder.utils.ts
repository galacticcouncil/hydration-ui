import { formatAssetAmount } from "@galacticcouncil/utils"
import Big from "big.js"

import { Papi } from "@/api/rpcClient"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { scale, scaleHuman } from "@/utils/formatting"

// fill_order takes the whole remaining amount, so it's only sent when that's what the user entered
export const isOtcFullFill = (otcOffer: OtcOffer, sellAmount: string) =>
  !otcOffer.isPartiallyFillable ||
  new Big(sellAmount).gte(otcOffer.assetAmountIn)

export const getOtcFillOrderTx = (
  papi: Papi,
  otcOffer: OtcOffer,
  sellAmount: string,
) => {
  return isOtcFullFill(otcOffer, sellAmount)
    ? papi.tx.OTC.fill_order({
        order_id: Number(otcOffer.id),
      })
    : papi.tx.OTC.partial_fill_order({
        order_id: Number(otcOffer.id),
        amount_in: BigInt(scale(sellAmount, otcOffer.assetIn.decimals)),
      })
}

export const getOtcFeeMultiplier = (feePct: string) => {
  return Big(1).minus(feePct || 0)
}

// pallet-otc ensure_remaining_order_valid: a partial fill must leave ED × multiplier
// on both legs (asset out net of fee), otherwise the order has to be filled whole
export const getOtcMaxPartialFill = (
  otcOffer: OtcOffer,
  edMultiplier: number,
  feePct: string,
) => {
  const { assetIn, assetOut } = otcOffer

  const minIn = Big(
    scaleHuman(assetIn.existentialDeposit, assetIn.decimals),
  ).times(edMultiplier)

  const minOutInAssetIn = Big(
    scaleHuman(assetOut.existentialDeposit, assetOut.decimals),
  )
    .times(edMultiplier)
    .div(getOtcFeeMultiplier(feePct))
    .times(otcOffer.assetAmountIn)
    .div(otcOffer.assetAmountOut)

  return Big(otcOffer.assetAmountIn)
    .minus(minIn.gt(minOutInAssetIn) ? minIn : minOutInAssetIn)
    .round(assetIn.decimals, Big.roundDown)
}

export const isOtcFillAmountValid = (
  otcOffer: OtcOffer,
  sellAmount: string,
  edMultiplier: number,
  feePct: string,
) =>
  Big(sellAmount).eq(otcOffer.assetAmountIn) ||
  (otcOffer.isPartiallyFillable &&
    Big(sellAmount).lte(getOtcMaxPartialFill(otcOffer, edMultiplier, feePct)))

// a balance that can't cover the whole order is capped to the largest valid partial fill
export const getOtcMaxFillAmount = (
  otcOffer: OtcOffer,
  balance: string,
  edMultiplier: number,
  feePct: string,
) =>
  Big(balance).gte(otcOffer.assetAmountIn)
    ? otcOffer.assetAmountIn
    : Big.max(
        0,
        Big.min(balance, getOtcMaxPartialFill(otcOffer, edMultiplier, feePct)),
      ).toString()

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
