import { pool, SdkCtx } from "@galacticcouncil/sdk-next"
import { aave } from "@galacticcouncil/sdk-next/pool"
import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { PublicClient } from "viem"

import { getGammaContracts } from "@/api/gamma/config"
import { loadBootstrapV3Pools } from "@/api/gamma/v3Bootstrap"
import { ENV } from "@/config/env"
import { useRpcProvider } from "@/providers/rpcProvider"
import { HUB_ID } from "@/utils/consts"

export type OmniPoolToken = pool.omni.OmniPoolToken
export type StableSwapBase = pool.stable.StableSwapBase
export type PoolBase = Omit<pool.PoolBase, "tokens"> & {
  tokens: [PoolToken, PoolToken]
}
export type PoolToken = pool.PoolToken
export type PoolFee = pool.PoolFee
export type V3Tick = pool.uniswapv3.V3Tick
// SDK V3 pool with optional ticks (EVM bootstrap reads omit them).
export type V3PoolBase = Omit<
  pool.uniswapv3.UniswapV3PoolBase,
  "tokens" | "ticks"
> & {
  tokens: [PoolToken, PoolToken]
  ticks?: V3Tick[]
}

export const PoolType = pool.PoolType

export type PoolTypeValue = pool.PoolType

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
          const [tokenA, tokenB] = pool.tokens
          if (!tokenA || !tokenB) continue

          v3Pools.push({
            ...pool,
            tokens: [tokenA, tokenB],
          } as V3PoolBase)
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

const v3PoolsQuery = (
  sdk: SdkCtx,
  queryClient: QueryClient,
  evm: PublicClient,
  endpoint: string,
) =>
  queryOptions<V3PoolBase[]>({
    queryKey: ["pools", "v3", endpoint],
    enabled: ENV.VITE_UNIV3_GAMMA_ENABLED,
    queryFn: async () => {
      const { v3Pools } = await queryClient.fetchQuery(allPools(sdk))

      const known = new Set(v3Pools.map((pool) => pool.address.toLowerCase()))
      const bootstrap = await loadBootstrapV3Pools(
        evm,
        sdk,
        getGammaContracts(endpoint),
      )
      const extra = bootstrap.filter(
        (pool) => !known.has(pool.address.toLowerCase()),
      )

      return [...v3Pools, ...extra]
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

export const useV3Pools = () => {
  const queryClient = useQueryClient()
  const { sdk, evm, endpoint } = useRpcProvider()

  return useQuery(v3PoolsQuery(sdk, queryClient, evm, endpoint))
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
  const { isReady, sdk } = useRpcProvider()
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
    enabled: isReady,
    notifyOnChangeProps: [],
  })
}
