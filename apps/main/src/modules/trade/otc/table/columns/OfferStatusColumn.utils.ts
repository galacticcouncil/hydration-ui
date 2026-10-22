import { otcOrderQuery } from "@galacticcouncil/indexer/neckwork"
import { useQuery } from "@tanstack/react-query"

import { neckworkClient } from "@/api/neckwork"

export const useInitialOtcOfferAmount = (
  offerId: string | undefined,
  isPartiallyFillable: boolean,
) => {
  const offerIdNumber = Number(offerId)

  const { data, isLoading } = useQuery(
    otcOrderQuery(neckworkClient, offerIdNumber, isPartiallyFillable),
  )

  const amounts = data
    ? {
        amountInInitial: data.amountIn || "0",
        amountOutInitial: data.amountOut || "0",
        assetInId: data.assetIn,
        assetOutId: data.assetOut,
      }
    : undefined

  return { data: amounts, isLoading }
}
