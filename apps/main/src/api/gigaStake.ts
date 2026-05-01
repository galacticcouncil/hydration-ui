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
    initialData: [],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const positions =
        await unsafeApi.query.GigaHdx.UnstakePositions.getValue(address)

      return positions as Array<{ amount: bigint; unlock_at: number }>
    },
  })
