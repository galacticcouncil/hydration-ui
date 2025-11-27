import { math } from "@galacticcouncil/sdk-next"
import Big from "big.js"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { OtcOffersType } from "@/routes/trade/otc"
import { AssetPrice } from "@/states/displayAsset"
import { Predicate } from "@/types/helpers"
import { scale } from "@/utils/formatting"

export const mapOtcOffersToTableData =
  (
    assetPrices: Record<string, AssetPrice>,
    referenceAssetDecimals: number | null,
  ) =>
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

    const marketPricePercentage =
      offerPrice &&
      typeof referenceAssetDecimals === "number" &&
      priceOut?.isValid &&
      Big(priceOut.price).gt(0)
        ? math.calculateDiffToRef(
            BigInt(scale(offerPrice, referenceAssetDecimals)),
            BigInt(scale(priceOut.price, referenceAssetDecimals)),
          )
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
  }
}
