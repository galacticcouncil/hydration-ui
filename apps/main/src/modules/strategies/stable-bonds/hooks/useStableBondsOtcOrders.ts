import { useMemo } from "react"

import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"

export const useStableBondsOtcOrders = (offerIds: number[]) => {
  const query = useOtcOffers()

  const data = useMemo(() => {
    if (!query.data) return []
    return query.data.filter(
      (offer) => !!offer.id && offerIds.includes(Number(offer.id)),
    )
  }, [query.data, offerIds])

  return { ...query, data }
}
