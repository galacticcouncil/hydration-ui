import { useQuery } from "@tanstack/react-query"

import { otcOrderStatusQuery } from "@/api/graphql/otc"
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

  const amountInInitial = data?.events[0]?.args?.amountIn || "0"
  const amountOutInitial = data?.events[0]?.args?.amountOut || "0"

  return { amountInInitial, amountOutInitial, isLoading }
}
