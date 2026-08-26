import { pool, SdkCtx } from "@galacticcouncil/sdk-next"
import { aave, uniswapv3 } from "@galacticcouncil/sdk-next/pool"
import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"
import { HUB_ID } from "@/utils/consts"

export type OmniPoolToken = pool.omni.OmniPoolToken
export type StableSwapBase = pool.stable.StableSwapBase
export type PoolBase = Omit<pool.PoolBase, "tokens"> & {
  tokens: [PoolToken, PoolToken]
}
export type PoolToken = pool.PoolToken
export type PoolFee = pool.PoolFee
export type V3PoolBase = uniswapv3.UniswapV3PoolBase

export const PoolType = pool.PoolType

export const allPools = (sdk: SdkCtx) =>
  queryOptions({
    queryKey: ["allPools"],
    queryFn: async () => {
      const pools = await sdk.api.router.getPools()

      const stablePools: StableSwapBase[] = []
      const xykPools: PoolBase[] = []
      const omnipoolTokens: OmniPoolToken[] = []
      const aavePools: aave.AavePool[] = []
      const v3Pools: V3PoolBase[] = []
      let hub: PoolToken | undefined

      for (const pool of pools) {
        if (pool.type === PoolType.Stable) {
          stablePools.push(pool as StableSwapBase)
        } else if (
          pool.type === PoolType.XYK &&
          pool.tokens.every((token) => !!token.decimals)
        ) {
          const [tokenA, tokenB] = pool.tokens
          if (!tokenA || !tokenB) continue

          xykPools.push({
            ...pool,
            tokens: [tokenA, tokenB],
          })
        } else if (pool.type === PoolType.Omni) {
          const tokens = pool.tokens as OmniPoolToken[]

          for (const token of tokens) {
            if (token.id === Number(HUB_ID)) {
              hub = token
            } else {
              omnipoolTokens.push(token)
            }
          }
        } else if (pool.type === PoolType.Aave) {
          aavePools.push(pool as aave.AavePool)
        } else if (pool.type === PoolType.V3) {
          v3Pools.push(pool as V3PoolBase)
        }
      }

      return {
        omnipoolTokens,
        stablePools,
        hub: hub,
        xykPools,
        aavePools,
        v3Pools,
        allPools: pools,
      }
    },
  })

export const stablePoolsQuery = (sdk: SdkCtx, queryClient: QueryClient) =>
  queryOptions<StableSwapBase[]>({
    queryKey: ["pools", "stable"],
    queryFn: async () => {
      const { stablePools } = await queryClient.ensureQueryData(allPools(sdk))

      return stablePools
    },
    staleTime: Infinity,
  })

export const hubTokenQuery = (sdk: SdkCtx, queryClient: QueryClient) =>
  queryOptions<PoolToken | undefined>({
    queryKey: ["pool", "hub"],
    queryFn: async () => {
      const { hub } = await queryClient.ensureQueryData(allPools(sdk))

      return hub
    },
    staleTime: Infinity,
  })

export const omnipoolTokensQuery = (sdk: SdkCtx, queryClient: QueryClient) =>
  queryOptions<OmniPoolToken[]>({
    queryKey: ["pools", "omnipool"],
    queryFn: async () => {
      const { omnipoolTokens } = await queryClient.ensureQueryData(
        allPools(sdk),
      )

      return omnipoolTokens
    },
    staleTime: Infinity,
  })

const v3PoolsQuery = (sdk: SdkCtx, queryClient: QueryClient) =>
  queryOptions<V3PoolBase[]>({
    queryKey: ["pools", "v3"],
    queryFn: async () => {
      const { v3Pools } = await queryClient.ensureQueryData(allPools(sdk))

      return v3Pools
    },
    staleTime: Infinity,
  })

/** Empty where `Parameters.UniswapV3Factory` is unset, since the venue disables itself */
export const useV3Pools = () => {
  const queryClient = useQueryClient()
  const { sdk } = useRpcProvider()

  return useQuery(v3PoolsQuery(sdk, queryClient))
}

export const xykPoolQuery = (
  sdk: SdkCtx,
  queryClient: QueryClient,
  address: string,
) =>
  queryOptions({
    queryKey: ["pool", "xyk", address],
    queryFn: async () => {
      const { xykPools } = await queryClient.ensureQueryData(allPools(sdk))

      return xykPools.find((pool) => pool.address === address)
    },
  })

const xykPoolsQuery = (sdk: SdkCtx, queryClient: QueryClient) =>
  queryOptions<PoolBase[]>({
    queryKey: ["pools", "xyk"],
    queryFn: async () => {
      const { xykPools } = await queryClient.ensureQueryData(allPools(sdk))

      return xykPools
    },
    staleTime: Infinity,
  })

export const useXykPools = () => {
  const queryClient = useQueryClient()
  const { sdk } = useRpcProvider()

  return useQuery(xykPoolsQuery(sdk, queryClient))
}

export const useXykPool = (address: string) => {
  const queryClient = useQueryClient()
  const { sdk } = useRpcProvider()

  return useQuery(xykPoolQuery(sdk, queryClient, address))
}

export const useStablePools = () => {
  const queryClient = useQueryClient()
  const { sdk } = useRpcProvider()

  return useQuery(stablePoolsQuery(sdk, queryClient))
}

export const useOmnipoolIds = () => {
  const { isApiLoaded, sdk } = useRpcProvider()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["omnipoolIds"],
    queryFn: async () => {
      const omnipoolTokens = await queryClient.ensureQueryData(
        omnipoolTokensQuery(sdk, queryClient),
      )

      return omnipoolTokens.map((token) => token.id.toString())
    },
    staleTime: Infinity,
    enabled: isApiLoaded,
    notifyOnChangeProps: [],
  })
}
