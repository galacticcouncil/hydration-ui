import { useMemo } from "react"

import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"

export const useStableBondsOtcOrders = (
  bondId: string,
  acceptedAssetIds: string[],
) => {
  const query = useOtcOffers()

  const data = useMemo(() => {
    if (!query.data) return []
    return query.data.filter((offer) => {
      return (
        offer.assetOut.id === bondId &&
        acceptedAssetIds.includes(offer.assetIn.id)
      )
    })
  }, [bondId, query.data, acceptedAssetIds])

  return { ...query, data }
}
