import { queryOptions } from "@tanstack/react-query"

import { isNeckworkNotFound, NeckworkClient, NeckworkResponse } from "."

export type OtcOrder = NeckworkResponse<"/v1/otc/orders/{orderId}">

export const otcOrderQuery = (
  client: NeckworkClient,
  orderId: number,
  isPartiallyFillable: boolean,
) =>
  queryOptions({
    staleTime: Infinity,
    queryKey: ["neckwork", "otc", "order", orderId],
    enabled: !!orderId && isPartiallyFillable,
    queryFn: async (): Promise<OtcOrder | null> => {
      try {
        const { data } = await client.GET("/v1/otc/orders/{orderId}", {
          params: { path: { orderId } },
        })

        if (!data) throw new Error("Neckwork API returned no OTC order")

        return data
      } catch (error) {
        if (isNeckworkNotFound(error)) return null
        throw error
      }
    },
  })
