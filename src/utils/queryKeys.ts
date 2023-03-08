import type { u32 } from "@polkadot/types"
import type { AccountId32 } from "@polkadot/types/interfaces"
import { CodecHash } from "@polkadot/types/interfaces/runtime"
import { u128 } from "@polkadot/types-codec"
import type BigNumber from "bignumber.js"
import { Maybe } from "utils/helpers"

export const QUERY_KEY_PREFIX = "@block"

export const QUERY_KEYS = {
  bestNumber: [QUERY_KEY_PREFIX, "bestNumber"],
  assetsTable: (id: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "assetsTable",
    id?.toString(),
  ],
  omniPositionId: (id: u128 | string) => [
    QUERY_KEY_PREFIX,
    "omniPositionId",
    id?.toString(),
  ],
  accountBalances: (id: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "accountBalances",
    id?.toString(),
  ],
  accountAssetBalances: (
    pairs: Array<[address: AccountId32 | string, assetId: u32 | string]>,
  ) => [QUERY_KEY_PREFIX, "accountAssetBalances", pairs],
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
  deposits: (poolId: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "deposits",
    poolId?.toString(),
  ],
  accountDepositIds: (accountId: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "depositIds",
    accountId?.toString(),
  ],
  globalFarms: (ids: Maybe<{ globalFarmId: u32 }[]>) => [
    QUERY_KEY_PREFIX,
    "globalFarms",
    ids?.map((i) => i.globalFarmId.toString()),
  ],
  yieldFarms: (
    ids: Maybe<
      {
        poolId: u32 | string
        globalFarmId: u32 | string
        yieldFarmId: u32 | string
      }[]
    >,
  ) => [QUERY_KEY_PREFIX, "yieldFarms", ids],
  activeYieldFarms: (poolId: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "activeYieldFarms",
    poolId?.toString(),
  ],
  globalFarm: (id: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "globalFarm",
    id?.toString(),
  ],
  yieldFarm: (ids: {
    poolId: Maybe<u32 | string>
    globalFarmId: Maybe<u32 | string>
    yieldFarmId: Maybe<u32 | string>
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
    periodsInFarm: Maybe<string>,
  ) => [
    "mathLoyaltyRates",
    plannedYieldingPeriods,
    initialRewardPercentage?.toString(),
    scaleCoef?.toString(),
    periodsInFarm,
  ],
  tradeVolume: (poolId: Maybe<string | u32>) => [
    QUERY_KEY_PREFIX,
    "tradeVolume",
    poolId?.toString(),
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
  hubAssetTradability: [QUERY_KEY_PREFIX, "hubAssetTradability"],
  omnipoolFee: [QUERY_KEY_PREFIX, "omnipoolFee"],
  omnipoolAsset: (id: u32 | string) => [
    QUERY_KEY_PREFIX,
    "omnipoolAsset",
    id?.toString(),
  ],
  omnipoolPositions: [QUERY_KEY_PREFIX, "omnipoolPositions"],
  omnipoolPosition: (id: u128 | undefined) => [
    QUERY_KEY_PREFIX,
    "omnipoolPosition",
    id?.toString(),
  ],
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
  tvlCap: [QUERY_KEY_PREFIX, "tvlCap"],
} as const
