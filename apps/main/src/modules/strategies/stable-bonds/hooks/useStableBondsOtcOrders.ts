import { useMemo } from "react"
import { isNonNullish } from "remeda"

import {
  OtcOffer,
  useOtcOffers,
} from "@/modules/trade/otc/table/OtcTable.query"
import { TAsset, useAssets } from "@/providers/assetsProvider"

const createEmptyOtcOffer = (assetIn: TAsset, assetOut: TAsset): OtcOffer => ({
  id: undefined,
  owner: "",
  assetIn,
  assetOut,
  amountIn: "0",
  amountOut: "0",
  assetAmountIn: "0",
  assetAmountOut: "0",
  isPartiallyFillable: false,
})

export const useStableBondsOtcOrders = (
  bondId: string,
  acceptedAssetIds: string[],
) => {
  const { getAsset } = useAssets()
  const query = useOtcOffers()
  const bondAsset = getAsset(bondId)

  const data = useMemo(() => {
    if (!query.data || !bondAsset) return []

    const realOrders = query.data.filter((offer) => {
      return (
        offer.assetOut.id === bondId &&
        acceptedAssetIds.includes(offer.assetIn.id)
      )
    })

    const coveredAssetIds = new Set(realOrders.map((order) => order.assetIn.id))

    const placeholderOrders = acceptedAssetIds
      .filter((assetId) => !coveredAssetIds.has(assetId))
      .map((assetId) => {
        const assetIn = getAsset(assetId)
        if (!assetIn) return null

        return createEmptyOtcOffer(assetIn, bondAsset)
      })
      .filter(isNonNullish)

    return [...realOrders, ...placeholderOrders]
  }, [acceptedAssetIds, bondAsset, getAsset, query.data, bondId])

  const isReady = query.isSuccess && !!bondAsset

  return { ...query, data, isReady }
}
