import type { u32 } from "@polkadot/types"
import type { AccountId32 } from "@polkadot/types/interfaces"

export const QUERY_KEY_PREFIX = "@block"

export const QUERY_KEYS = {
  bestNumber: ["bestNumber"],
  pools: [QUERY_KEY_PREFIX, "pools"],
  poolShareToken: (poolId: AccountId32) => [
    QUERY_KEY_PREFIX,
    "poolShareToken",
    poolId.toString(),
  ],
  globalFarms: (ids: u32[]) => [
    QUERY_KEY_PREFIX,
    "globalFarms",
    ...ids.map((i) => i.toString()),
  ],
  yieldFarms: (ids: Record<string, any>) => [
    QUERY_KEY_PREFIX,
    "yieldFarms",
    ids,
  ],
  activeYieldFarms: (poolId: AccountId32) => [
    QUERY_KEY_PREFIX,
    "activeYieldFarms",
    poolId.toString(),
  ],
  globalFarm: (id: string) => [QUERY_KEY_PREFIX, "globalFarm", id],
  yieldFarm: (id: string) => [QUERY_KEY_PREFIX, "yieldFarm", id],
  activeYieldFarm: (id: string) => [QUERY_KEY_PREFIX, "activeYieldFarm", id],
  totalLiquidity: (id: string) => [QUERY_KEY_PREFIX, "totalLiquidity", id],
  totalLiquidities: (ids: string[]) => [
    QUERY_KEY_PREFIX,
    "totalLiquidities",
    ...ids,
  ],
  tokenBalance: (id: string, address?: string) => [
    QUERY_KEY_PREFIX,
    "tokenBalance",
    id,
    address,
  ],
  tokensBalances: (ids: string[], address?: string) => [
    QUERY_KEY_PREFIX,
    "tokenBalances",
    address,
    ...ids,
  ],
  assetDetails: (id: string) => [QUERY_KEY_PREFIX, "assetDetails", id],
  assetMeta: (id: string) => [QUERY_KEY_PREFIX, "assetMeta", id],
  exchangeFee: [QUERY_KEY_PREFIX, "exchangeFee"],
  math: ["@galacticcouncil/math"],
} as const
