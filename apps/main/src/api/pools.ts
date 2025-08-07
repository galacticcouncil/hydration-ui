import { pool, SdkCtx } from "@galacticcouncil/sdk-next"
import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect } from "react"
import { useShallow } from "zustand/shallow"

import { useIsActiveQueries } from "@/hooks/useIsActiveQueries"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  setOmnipoolIds,
  setXYKPools,
  useXYKPoolsStore,
} from "@/states/liquidity"
import { HUB_ID } from "@/utils/consts"

export type OmniPoolToken = pool.omni.OmniPoolToken
type StableSwap = pool.stable.StableSwap
export type PoolBase = pool.PoolBase
export type PoolToken = pool.PoolToken

const PoolType = pool.PoolType

export const allPools = (
  tradeRouter: SdkCtx["api"]["router"],
  queryClient: QueryClient,
) =>
  queryOptions({
    queryKey: ["allPools"],
    queryFn: async () => {
      const pools = await tradeRouter.getPools()

      const stablePools_: StableSwap[] = []
      const xykPools_: PoolBase[] = []
      const omnipoolTokens_: OmniPoolToken[] = []
      let hub: PoolToken | undefined

      for (const pool of pools) {
        if (pool.type === PoolType.Stable) {
          stablePools_.push(pool as StableSwap)
        } else if (pool.type === PoolType.XYK) {
          xykPools_.push(pool)
        } else if (pool.type === PoolType.Omni) {
          const tokens = pool.tokens as OmniPoolToken[]

          for (const token of tokens) {
            if (token.id === Number(HUB_ID)) {
              hub = token
            } else {
              omnipoolTokens_.push(token)
            }
          }
        }
      }

      queryClient.setQueryData(omnipoolTokens.queryKey, omnipoolTokens_)
      queryClient.setQueryData(stablePools.queryKey, stablePools_)
      queryClient.setQueryData(hubToken.queryKey, hub)
      queryClient.setQueryData(xykPools.queryKey, xykPools_)

      return false
    },
  })

export const useAllPools = () => {
  const { isApiLoaded, sdk } = useRpcProvider()
  const queryClient = useQueryClient()
  const activeQueriesAmount = useIsActiveQueries(["pools"])

  return useQuery({
    ...allPools(sdk.api.router, queryClient),
    notifyOnChangeProps: [],
    enabled: isApiLoaded && activeQueriesAmount,
  })
}

export const stablePools = queryOptions<StableSwap[]>({
  queryKey: ["pools", "stable"],
  queryFn: () => {
    throw new Error("queryFn should not run")
  },
  staleTime: Infinity,
})

export const hubToken = queryOptions<PoolToken>({
  queryKey: ["pools", "hub"],
  queryFn: () => {
    throw new Error("queryFn should not run")
  },
  staleTime: Infinity,
})

export const omnipoolTokens = queryOptions<OmniPoolToken[]>({
  queryKey: ["pools", "omnipool"],
  queryFn: () => {
    throw new Error("queryFn should not run")
  },
  staleTime: Infinity,
})

const xykPools = queryOptions<PoolBase[]>({
  queryKey: ["pools", "xyk"],
  queryFn: () => {
    throw new Error("queryFn should not run")
  },
  staleTime: Infinity,
})

export const useXykPools = () => {
  const storedXykPoolsLength = useXYKPoolsStore(
    useShallow((state) => state.data?.length),
  )

  const query = useQuery(xykPools)

  const data = query.data

  useEffect(() => {
    if (data && data.length !== storedXykPoolsLength) {
      const validAddresses = data
        .filter((pool) => pool.tokens.some((asset) => asset))
        .map((pool) => pool.address)

      setXYKPools({ validAddresses })
    }
  }, [data, storedXykPoolsLength])

  return query
}

export const useOmnipoolIds = () => {
  const { isApiLoaded, papi } = useRpcProvider()

  useQuery({
    queryKey: ["omnipoolIds"],
    queryFn: async () => {
      const assets = await papi.query.Omnipool.Assets.getEntries()
      const ids = assets.map(({ keyArgs }) => keyArgs[0].toString())

      setOmnipoolIds(ids)

      return null
    },
    staleTime: Infinity,
    enabled: isApiLoaded,
    notifyOnChangeProps: [],
  })
}

export const useXykPoolsIds = () => {
  const { isApiLoaded, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["xykPoolsIds"],
    queryFn: async () => {
      const pools = await papi.query.XYK.ShareToken.getEntries()

      return new Map(
        pools.map((pool) => [pool.keyArgs[0], pool.value.toString()]),
      )
    },
    staleTime: Infinity,
    enabled: isApiLoaded,
    notifyOnChangeProps: [],
  })
}
