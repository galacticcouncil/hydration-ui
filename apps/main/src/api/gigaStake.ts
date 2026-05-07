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

      const [minStake, cooldownPeriod] = await Promise.all([
        unsafeApi.constants.GigaHdx.MinStake(),
        unsafeApi.constants.GigaHdx.CooldownPeriod(),
      ])

      return {
        minStake,
        cooldownPeriod,
      } as {
        minStake: bigint
        /** blocks number after unstaking */
        cooldownPeriod: number
      }
    },
    staleTime: millisecondsInHour,
    gcTime: GC_TIME,
  })

export const gigaUnstakePositionsQuery = (
  rpc: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: ["gigaUnstakePositions", address],
    enabled: !!address && rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const position =
        await unsafeApi.query.GigaHdx.PendingUnstakes.getValue(address)

      return position as { amount: bigint; expires_at: number }
    },
  })
