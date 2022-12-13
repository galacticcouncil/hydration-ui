import type { u32 } from "@polkadot/types"
import type { AccountId32 } from "@polkadot/types/interfaces"
import { CodecHash } from "@polkadot/types/interfaces/runtime"
import { u128 } from "@polkadot/types-codec"
import type BigNumber from "bignumber.js"
import { Maybe } from "utils/helpers"

export const QUERY_KEY_PREFIX = "@block"

export const QUERY_KEYS = {
  bestNumber: [QUERY_KEY_PREFIX, "bestNumber"],
  accountBalances: (id: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "accountBalances",
    id?.toString(),
  ],
  pools: [QUERY_KEY_PREFIX, "pools"],
  poolShareToken: (poolId: AccountId32 | string) => [
    QUERY_KEY_PREFIX,
    "poolShareToken",
    poolId.toString(),
  ],
  poolAssets: (address: AccountId32 | string) => [
    QUERY_KEY_PREFIX,
    "poolAssets",
    address.toString(),
  ],
  deposit: (id: Maybe<u128>) => [QUERY_KEY_PREFIX, "deposit", id?.toString()],
  deposits: (poolId?: string) => [QUERY_KEY_PREFIX, "deposits", poolId],
  accountDepositIds: (accountId: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "depositIds",
    accountId?.toString(),
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
  globalFarm: (id: u32) => [QUERY_KEY_PREFIX, "globalFarm", id.toString()],
  yieldFarm: (ids: {
    poolId: AccountId32 | string
    globalFarmId: u32 | string
    yieldFarmId: u32 | string
  }) => [QUERY_KEY_PREFIX, "yieldFarm", ids],
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
  tokenBalance: (
    id: Maybe<string | u32>,
    address: Maybe<AccountId32 | string>,
  ) => [QUERY_KEY_PREFIX, "tokenBalance", id?.toString(), address],
  tokensBalances: (ids: string[], address?: string) => [
    QUERY_KEY_PREFIX,
    "tokenBalances",
    address,
    ...ids,
  ],
  assets: [QUERY_KEY_PREFIX, "assets"],
  assetsMeta: [QUERY_KEY_PREFIX, "assetsMeta"],
  tradeAssets: [QUERY_KEY_PREFIX, "tradeAssets"],
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
  nextNonce: (account: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "nonce",
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
  mathLoyaltyRates: (
    plannedYieldingPeriods: u32,
    initialRewardPercentage: Maybe<u128>,
    scaleCoef: Maybe<u32>,
  ) => [
    "mathLoyaltyRates",
    plannedYieldingPeriods,
    initialRewardPercentage?.toString(),
    scaleCoef?.toString(),
  ],
  tradeVolume: (poolId: Maybe<string>) => [
    QUERY_KEY_PREFIX,
    "tradeVolume",
    poolId,
  ],
  timestamp: (bestNumber: Maybe<u32 | BigNumber>) =>
    bestNumber != null
      ? ["timestamp", bestNumber]
      : [QUERY_KEY_PREFIX, "timestamp"],
  vestingSchedules: (address: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "vestingSchedules",
    address,
  ],
  vestingLockBalance: (address: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "vestingLock",
    address,
  ],
  lock: (address: Maybe<AccountId32 | string>, asset: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "lock",
    address,
    asset,
  ],
  uniques: (address: string | AccountId32, collectionId: string | u128) => [
    QUERY_KEY_PREFIX,
    "uniques",
    address.toString(),
    collectionId.toString(),
  ],
  omnipoolAssets: [QUERY_KEY_PREFIX, "omnipoolAssets"],
  omnipoolAsset: (id: u32 | string) => [
    QUERY_KEY_PREFIX,
    "omnipoolAsset",
    id?.toString(),
  ],
  omnipoolPositions: [QUERY_KEY_PREFIX, "omnipoolPositions"],
  provider: (url: string) => ["provider", url],
  math: ["@galacticcouncil/math"],
  existentialDeposit: [QUERY_KEY_PREFIX, "existentialDeposit"],
  metadataVersion: ["metadataVersion"],
  acceptedCurrencies: (address: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "acceptedCurrencies",
    address,
  ],
  acceptedCurrency: (id: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "acceptedCurrency",
    id,
  ],
  accountCurrency: (address: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "accountCurrency",
    address,
  ],
  apiIds: [QUERY_KEY_PREFIX, "apiIds"],
} as const
