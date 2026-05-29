import { uuid } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import {
  OtcOffer,
  useOtcOffers,
} from "@/modules/trade/otc/table/OtcTable.query"
import { TAsset, useAssets } from "@/providers/assetsProvider"

const createEmptyOtcOffer = (assetIn: TAsset, assetOut: TAsset): OtcOffer => ({
  id: uuid(),
  owner: "",
  assetIn,
  assetOut,
  amountIn: "0",
  amountOut: "0",
  assetAmountIn: "0",
  assetAmountOut: "0",
  isPartiallyFillable: false,
})

const matchesStableBondOtcOffer = (
  offer: OtcOffer,
  bondId: string,
  acceptedAssetIds: string[],
  otcOfferIds: string[],
) =>
  offer.assetOut.id === bondId &&
  acceptedAssetIds.includes(offer.assetIn.id) &&
  offer.id !== undefined &&
  otcOfferIds.includes(offer.id)

export const useStableBondsOtcOrders = (
  bondId: string,
  acceptedAssetIds: string[],
  otcOfferIds: string[],
) => {
  const { getAsset } = useAssets()
  const query = useOtcOffers()
  const bondAsset = getAsset(bondId)

  const data = useMemo(() => {
    if (!query.data || !bondAsset) return []

    const realOrders = query.data.filter((offer) =>
      matchesStableBondOtcOffer(offer, bondId, acceptedAssetIds, otcOfferIds),
    )

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
  }, [acceptedAssetIds, bondAsset, getAsset, otcOfferIds, query.data, bondId])

  const isReady = query.isSuccess && !!bondAsset

  return { ...query, data, isReady }
}

export const useHasFillableStableBondsOrders = () => {
  const query = useOtcOffers()

  const hasFillableOrders = useMemo(() => {
    if (!query.data) return false

    return Object.values(STABLE_BONDS).some((config) =>
      query.data.some(
        (offer) =>
          matchesStableBondOtcOffer(
            offer,
            config.bondId,
            config.otcAcceptedAssetIds,
            config.otcOfferIds,
          ) && Big(offer.assetAmountIn).gt(0),
      ),
    )
  }, [query.data])

  return hasFillableOrders
}
