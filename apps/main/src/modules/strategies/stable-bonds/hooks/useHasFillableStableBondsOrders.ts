import Big from "big.js"
import { useMemo } from "react"

import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"

export const useHasFillableStableBondsOrders = () => {
  const query = useOtcOffers()

  const hasFillableOrders = useMemo(() => {
    if (!query.data) return false

    return Object.values(STABLE_BONDS).some((config) =>
      query.data.some(
        (offer) =>
          offer.assetOut.id === config.bondId &&
          config.otcAcceptedAssetIds.includes(offer.assetIn.id) &&
          Big(offer.assetAmountIn).gt(0),
      ),
    )
  }, [query.data])

  return hasFillableOrders
}
