import { otcOrderStatusQuery } from "@galacticcouncil/indexer/indexer"
import { useQuery } from "@tanstack/react-query"

import { useIndexerClient } from "@/api/provider"

export const useInitialOtcOfferAmount = (
  offerId: string | undefined,
  isPartiallyFillable: boolean,
) => {
  const offerIdNumber = Number(offerId)
  const indexerClient = useIndexerClient()

  const { data, isLoading } = useQuery(
    otcOrderStatusQuery(indexerClient, offerIdNumber, isPartiallyFillable),
  )

  const eventArgs = data?.events[0]?.args
  const amounts = eventArgs
    ? {
        amountInInitial: eventArgs.amountIn || "0",
        amountOutInitial: eventArgs.amountOut || "0",
      }
    : undefined

  return { data: amounts, isLoading }
}
