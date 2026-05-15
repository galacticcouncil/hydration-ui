import { STHDX_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
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

export const gigaQueryKey = (address: string) => ["gigaStake", address]

export const gigaUnstakePositionsQuery = (
  rpc: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: [...gigaQueryKey(address), "pendingPositions"],
    enabled: !!address && rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const entries = await unsafeApi.query.GigaHdx.PendingUnstakes.getEntries(
        address,
        { at: "best" },
      )

      return entries.map(
        ({ keyArgs, value }: { keyArgs: [string, number]; value: bigint }) => ({
          amount: value,
          voteAtBlock: keyArgs[1],
        }),
      ) as Array<{ amount: bigint; voteAtBlock: number }>
    },
  })

export const gigaAccountStakesQuery = (
  rpc: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: [...gigaQueryKey(address), "stakes"],
    enabled: !!address && rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakes = await unsafeApi.query.GigaHdx.Stakes.getValue(address, {
        at: "best",
      })

      return stakes as {
        hdx: bigint
        gigahdx: bigint
        frozen: bigint
        unstaking: bigint
        unstakingCount: number
      }
    },
  })

export const gigaTotalLockedQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["gigaTotalLocked"],
    enabled: rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const totalLocked = await unsafeApi.query.GigaHdx.TotalLocked.getValue({
        at: "best",
      })

      return totalLocked as bigint
    },
  })

export const gigaHDXIssuanceQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["totalIssuance", STHDX_ASSET_ID],
    enabled: rpc.isApiLoaded,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
    queryFn: async () => {
      return await rpc.papi.query.Tokens.TotalIssuance.getValue(
        Number(STHDX_ASSET_ID),
        {
          at: "best",
        },
      )
    },
  })

export const useGigaStakeExchangeRate = () => {
  const rpc = useRpcProvider()

  const {
    data: totalIssuance,
    isSuccess: isTotalIssuanceSuccess,
    isLoading: isTotalIssuanceLoading,
  } = useQuery(gigaHDXIssuanceQuery(rpc))
  const {
    data: gigaLockedHDX,
    isSuccess: isGigaLockedHDXSuccess,
    isLoading: isGigaLockedHDXLoading,
  } = useQuery(gigaTotalLockedQuery(rpc))

  return {
    isLoading: isTotalIssuanceLoading || isGigaLockedHDXLoading,
    data:
      isTotalIssuanceSuccess && isGigaLockedHDXSuccess
        ? gigaLockedHDX / totalIssuance
        : undefined,
  }
}
