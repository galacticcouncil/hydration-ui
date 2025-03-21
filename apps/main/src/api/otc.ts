import { queryOptions } from "@tanstack/react-query"
import { Graffle } from "graffle"

import { OtcOrderStatusDocument } from "@/codegen/__generated__/indexer/graphql"
import { TProviderContext } from "@/providers/rpcProvider"

const graffle = Graffle.create().transport({
  url: import.meta.env.VITE_INDEXER_URL,
})

export const otcOrderStatusQuery = (
  orderId: number,
  isPartiallyFillable: boolean,
) =>
  queryOptions({
    queryKey: ["trade", "otc", "OrderStatus", orderId],
    queryFn: () => graffle.gql(OtcOrderStatusDocument).send({ orderId }),
    enabled: !!orderId && isPartiallyFillable,
  })

export const otcExistentialDepositorMultiplierQuery = (
  rpc: TProviderContext,
) => {
  const { papi, isApiLoaded } = rpc

  return queryOptions({
    queryKey: ["trade", "otc", "constants", "existentialDepositorMultiplier"],
    queryFn: () => papi.constants.OTC.ExistentialDepositMultiplier(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })
}
