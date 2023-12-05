import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { Maybe } from "graphql/jsutils/Maybe"
import { useRpcProvider } from "providers/rpcProvider"
import { ChartType } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

export type StatsData = {
  timestamp: string
  volume_usd: number
  tvl_usd: number
  tvl_pol_usd: number
  volume_roll_24_usd: number
}

export enum StatsTimeframe {
  DAILY = "daily",
  HOURLY = "hourly",
}

export const useStats = (
  data: Maybe<{
    timeframe?: StatsTimeframe
    assetId?: string
    type: ChartType
  }>,
) => {
  const { timeframe, assetId, type = "tvl" } = data ?? {}
  return useQuery(
    QUERY_KEYS.stats(type, timeframe, assetId),
    async () => {
      const res =
        type === "volume"
          ? await getStats(timeframe, assetId)()
          : await getStatsTvl(assetId)()

      if (!res.length) {
        throw new Error("Error fetching stats data")
      }

      return res
    },
    { retry: 0 },
  )
}

const getStats = (timeframe?: StatsTimeframe, assetId?: string) => async () => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/charts/volume${
      assetId != null ? `/${assetId}` : ""
    }${timeframe ? `?timeframe=${timeframe}` : ""}`,
  )

  const data: Promise<StatsData[]> = res.json()

  return data
}

const getStatsTvl = (assetId?: string) => async () => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/charts/tvl${
      assetId != null ? `/${assetId}` : ""
    }`,
  )

  const data: Promise<StatsData[]> = res.json()

  return data
}

export const useTVLs = (assetIds: string[]) => {
  return useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: QUERY_KEYS.tvl(assetId),
      queryFn:
        assetId != null
          ? async () => {
              const data = await getTVL(assetId)
              return { tvl_usd: data?.[0].tvl_usd, assetId }
            }
          : undefinedNoop,
      enabled: !!assetId,
    })),
  })
}

const getTVL = async (assetId?: string) => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/tvl${
      assetId != null ? `/${assetId}` : ""
    }`,
  )
  const data: Promise<{ tvl_usd: number }[]> = res.json()

  return data
}

export const useFee = (assetId?: string | "all") => {
  const { assets } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.fee(assetId),
    assetId
      ? async () => {
          const asset_id = assetId === "all" ? undefined : assetId
          const data = await geFee(asset_id)

          if (assets.native.id === asset_id)
            return { ...data[0], projected_apy_perc: 0 }

          return data[0]
        }
      : undefinedNoop,
    {
      enabled: !!assetId,
      refetchInterval: 60000,
    },
  )
}

const geFee = async (assetId?: string) => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/fees/${
      assetId != null ? `/${assetId}` : ""
    }`,
  )
  const data: Promise<
    { accrued_fees_usd: number; projected_apy_perc: number }[]
  > = res.json()

  return data
}

export const useAccountsIdentity = (addresses: string[]) => {
  const { api } = useRpcProvider()

  return useQueries({
    queries: addresses.map((address) => ({
      queryKey: QUERY_KEYS.identity(address),
      queryFn:
        address != null ? getAccountIdentity(api, address) : undefinedNoop,
      enabled: !!address,
    })),
  })
}

export const useAccountIdentity = (address: string) => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.identity(address),
    getAccountIdentity(api, address),
  )
}

const getAccountIdentity = (api: ApiPromise, address: string) => async () => {
  const res = await api.query.identity.identityOf(address)

  return { address, identity: res.isSome ? res.unwrapOr(null) : null }
}
