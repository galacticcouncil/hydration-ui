import type { u32 } from "@polkadot/types"
import type { AccountId32 } from "@polkadot/types/interfaces"
import { CodecHash } from "@polkadot/types/interfaces/runtime"
import { Maybe } from "./types"

export const QUERY_KEY_PREFIX = "@block"

export const QUERY_KEYS = {
  bestNumber: ["bestNumber"],
  pools: [QUERY_KEY_PREFIX, "pools"],
  poolShareToken: (poolId: AccountId32 | string) => [
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
  activeYieldFarms: (poolId: AccountId32 | string) => [
    QUERY_KEY_PREFIX,
    "activeYieldFarms",
    poolId.toString(),
  ],
  globalFarm: (id: string) => [QUERY_KEY_PREFIX, "globalFarm", id],
  yieldFarm: (id: string) => [QUERY_KEY_PREFIX, "yieldFarm", id],
  activeYieldFarm: (id: string) => [QUERY_KEY_PREFIX, "activeYieldFarm", id],
  totalLiquidity: (id: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "totalLiquidity",
    id?.toString(),
  ],
  totalIssuance: (lpToken: Maybe<u32>) => [
    QUERY_KEY_PREFIX,
    "totalIssuance",
    lpToken?.toString(),
  ],
  totalLiquidities: (ids: string[]) => [
    QUERY_KEY_PREFIX,
    "totalLiquidities",
    ...ids,
  ],
  tokenBalance: (id: string | undefined, address?: AccountId32 | string) => [
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
  assets: [QUERY_KEY_PREFIX, "assets"],
  assetDetails: (id: Maybe<string>) => [QUERY_KEY_PREFIX, "assetDetails", id],
  assetMeta: (id: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "assetMeta",
    id?.toString(),
  ],
  exchangeFee: [QUERY_KEY_PREFIX, "exchangeFee"],
  calculateTotalLiqInPools: [QUERY_KEY_PREFIX, "totalLiqInPools"],
  spotPrice: (assetA: string, assetB: string) => [
    QUERY_KEY_PREFIX,
    "spotPrice",
    assetA,
    assetB,
  ],
  paymentInfo: (hash: CodecHash, account?: AccountId32 | string) => [
    QUERY_KEY_PREFIX,
    "paymentInfo",
    hash,
    account,
  ],
  bestBuy: (params: Record<string, any>) => [
    QUERY_KEY_PREFIX,
    "bestBuy",
    params,
  ],
  bestSell: (params: Record<string, any>) => [
    QUERY_KEY_PREFIX,
    "bestSell",
    params,
  ],
  provider: (url: string) => ["provider", url],
  math: ["@galacticcouncil/math"],
} as const
