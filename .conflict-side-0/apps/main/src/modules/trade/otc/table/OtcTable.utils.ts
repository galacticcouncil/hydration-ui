import { BigNumber, calculateDiffToRef } from "@galacticcouncil/sdk"
import Big from "big.js"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { OtcOffersType } from "@/routes/_trade/trade.otc"
import { AssetPrice } from "@/states/displayAsset"
import { Predicate } from "@/types/helpers"
import { scaleHuman } from "@/utils/formatting"

export const mapOtcOffersToTableData =
  (assetPrices: Record<string, AssetPrice>) =>
  (offer: OtcOffer): OtcOfferTabular => {
    const { assetIn, amountIn, assetOut, amountOut } = offer
    const usdPriceIn = assetPrices[assetIn.id]?.price
    const usdPriceOut = assetPrices[assetOut.id]?.price

    const assetAmountIn = scaleHuman(amountIn, assetIn?.decimals ?? 12)
    const assetAmountOut = scaleHuman(amountOut, assetOut?.decimals ?? 12)

    const offerPrice =
      usdPriceIn && usdPriceIn !== "NaN"
        ? new Big(assetAmountIn).mul(usdPriceIn).div(assetAmountOut).toString()
        : null

    const marketPricePercentage = offerPrice
      ? usdPriceOut && usdPriceOut !== "NaN"
        ? calculateDiffToRef(
            new BigNumber(usdPriceOut),
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
