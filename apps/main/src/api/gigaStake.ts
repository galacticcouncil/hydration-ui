import { queryOptions } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"

import { TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME } from "@/utils/consts"

export const gigaStakeConstantsQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["gigaStake", "constants"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const [minStake] = await Promise.all([
        unsafeApi.constants.GigaHdx.MinStake(),
      ])

      return {
        minStake,
      }
    },
    staleTime: millisecondsInHour,
    gcTime: GC_TIME,
  })
