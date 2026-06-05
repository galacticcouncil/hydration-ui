import { RUNTIME_DECIMALS } from "@galacticcouncil/common"
import { math } from "@galacticcouncil/sdk-next"
import Big from "big.js"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { OtcOffersType } from "@/routes/trade/otc"
import { AssetPrice } from "@/states/displayAsset"
import { Predicate } from "@/types/helpers"
import { toBigInt } from "@/utils/formatting"

export const mapOtcOffersToTableData =
  (assetPrices: Record<string, AssetPrice>) =>
  (offer: OtcOffer): OtcOfferTabular => {
    const { assetIn, assetOut, assetAmountIn, assetAmountOut } = offer
    const priceIn = assetPrices[assetIn.id]
    const priceOut = assetPrices[assetOut.id]

    const offerPrice =
      priceIn?.isValid && Big(priceIn.price).gt(0)
        ? new Big(assetAmountIn)
            .mul(priceIn.price)
            .div(assetAmountOut)
            .toString()
        : null

    const marketPrice =
      priceOut?.isValid && Big(priceOut.price).gt(0) ? priceOut.price : null

    // Native exchange rate of the order: how much of the accepting asset (assetIn)
    // is paid per 1 unit of the offered asset (assetOut). Oracle-independent.
    const nativePrice = Big(assetAmountOut).gt(0)
      ? new Big(assetAmountIn).div(assetAmountOut).toString()
      : null

    // Same rate at market, derived from the two display-currency prices:
    // (USD per assetOut) / (USD per assetIn) = assetIn per assetOut.
    const nativeMarketPrice =
      priceIn?.isValid &&
      priceOut?.isValid &&
      Big(priceIn.price).gt(0) &&
      Big(priceOut.price).gt(0)
        ? new Big(priceOut.price).div(priceIn.price).toString()
        : null

    const marketPricePercentage =
      offerPrice && marketPrice
        ? math.calculateDiffToRef(
            toBigInt(offerPrice, RUNTIME_DECIMALS),
            toBigInt(marketPrice, RUNTIME_DECIMALS),
          )
        : null

    return {
      ...offer,
      assetAmountIn,
      assetAmountOut,
      offerPrice,
      nativePrice,
      marketPrice,
      nativeMarketPrice,
      marketPricePercentage,
    }
  }

export const getOtcOfferFilter = (
  offersType: OtcOffersType,
  userAddress: string | null,
): Predicate<OtcOffer> => {
  switch (offersType) {
    case "all":
      return () => true
    case "my":
      return (offer) => offer.owner === userAddress
  }
}
