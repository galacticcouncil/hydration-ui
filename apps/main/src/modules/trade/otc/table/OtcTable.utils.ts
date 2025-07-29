import { BigNumber, calculateDiffToRef } from "@galacticcouncil/sdk"
import Big from "big.js"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { OtcOffersType } from "@/routes/trade/otc"
import { AssetPrice } from "@/states/displayAsset"
import { Predicate } from "@/types/helpers"

export const mapOtcOffersToTableData =
  (assetPrices: Record<string, AssetPrice>) =>
  (offer: OtcOffer): OtcOfferTabular => {
    const { assetIn, assetOut, assetAmountIn, assetAmountOut } = offer
    const usdPriceIn = assetPrices[assetIn.id]
    const usdPriceOut = assetPrices[assetOut.id]

    const offerPrice = usdPriceIn?.isValid
      ? new Big(assetAmountIn)
          .mul(usdPriceIn.price)
          .div(assetAmountOut)
          .toString()
      : null

    const marketPricePercentage = offerPrice
      ? usdPriceOut?.isValid
        ? calculateDiffToRef(
            new BigNumber(usdPriceOut.price),
            new BigNumber(offerPrice.toString()),
          ).toNumber()
        : 0
      : null

    return {
      ...offer,
      assetAmountIn,
      assetAmountOut,
      offerPrice,
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
    case "partially-fillable":
      return (offer) => offer.isPartiallyFillable
  }
}
