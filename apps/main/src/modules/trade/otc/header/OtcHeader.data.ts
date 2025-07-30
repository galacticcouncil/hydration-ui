import Big from "big.js"

import { useOtcOffersQuery } from "@/modules/trade/otc/table/OtcTable.query"
import { useAssetsPrice } from "@/states/displayAsset"

export const useOtcHeaderData = () => {
  const { data, isLoading } = useOtcOffersQuery()

  const assetIds = Array.from(new Set(data?.map((offer) => offer.assetIn.id)))

  const { isLoading: isPriceLoading, getAssetPrice } = useAssetsPrice(assetIds)

  const otcValue =
    data
      ?.reduce((acc, offer) => {
        const price = getAssetPrice(offer.assetIn.id)
        const offerValue = Big(price.isValid ? price.price : 0).times(
          offer.assetAmountIn,
        )

        return acc.plus(offerValue)
      }, Big(0))
      .toNumber() ?? 0

  return {
    otcValue,
    sold: 10301874,
    volume: 10301874,
    isLoading: isLoading || isPriceLoading,
  }
}
