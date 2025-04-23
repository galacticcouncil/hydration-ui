import { useQuery } from "@tanstack/react-query"

import { otcOrderStatusQuery } from "@/api/otc"

export const useInitialOtcOfferAmount = (
  offerId: string | undefined,
  isPartiallyFillable: boolean,
) => {
  const offerIdNumber = Number(offerId)

  const { data, isLoading } = useQuery(
    otcOrderStatusQuery(offerIdNumber, isPartiallyFillable),
  )

  const amountInInitial: string = data?.events[0]?.args?.amountIn ?? "0"
  const amountOutInitial: string = data?.events[0]?.args?.amountOut ?? "0"

  return { amountInInitial, amountOutInitial, isLoading }
}
