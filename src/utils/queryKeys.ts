import type { u32 } from "@polkadot/types"
import type { AccountId32 } from "@polkadot/types/interfaces"
import { CodecHash } from "@polkadot/types/interfaces/runtime"
import { StatsTimeframe } from "api/stats"
import type BigNumber from "bignumber.js"
import { Maybe } from "utils/helpers"
import { ChartType } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { PaginationState } from "@tanstack/react-table"
import { EventName } from "sections/lending/subsections/history/types"

export const QUERY_KEY_PREFIX = "@block"

export const QUERY_KEYS = {
  hdxIssuance: ["hdxIssuance"],
  assets: (rpc: string) => ["assets", rpc],
  bondsAssets: ["bondsAssets"],
  providerAccounts: (provider: string | undefined) => [
    "web3Accounts",
    provider,
  ],
  walletEnable: (provider: string | null) => ["web3Enable", provider],
  bestNumber: (ws: string) => [QUERY_KEY_PREFIX, "bestNumber", ws],
  assetsTable: (id: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "assetsTable",
    id?.toString(),
  ],
  accountBalances: (id?: string) => ["accountBalances", id],
  accountPositions: (address: string | undefined) => [
    "accountPositions",
    address,
  ],
  accountClaimableFarmValues: (address: string | undefined) => [
    "accountClaimableFarmValues",
    address,
  ],
  accountsBalances: (ids: string[]) => [
    QUERY_KEY_PREFIX,
    "accountsBalances",
    ids.join("."),
  ],
  accountSystemBalance: ["accountsBalances"],
  accountTokenBalances: ["accountTokenBalances"],
  accountErc20Balance: ["accountErc20Balance"],
  allPools: ["allPools"],
  omnipoolTokens: ["pools", "omnipoolTokens"],
  stablePools: ["pools", "stable"],
  stablepoolFees: ["pools", "stable", "fees"],
  xykPools: ["pools", "xykPool"],
  hubToken: ["pools", "hubToken"],
  dynamicAssetFee: (id: Maybe<u32 | string>) => [
    "dynamicAssetFee",
    id?.toString(),
  ],
  omnipoolMinLiquidity: ["omnipoolMinLiquidity"],
  omnipoolActiveFarms: ["omnipoolActiveFarms"],
  omnipoolActiveFarm: (id?: string) => ["omnipoolActiveFarm", id],
  omnipoolFarms: ["omnipoolFarms"],
  omnipoolFarm: (id?: string) => ["omnipoolFarm", id],
  stoppedOmnipoolFarms: (address?: string) => ["stoppedOmnipoolFarms", address],
  xykActiveFarms: ["xykActiveFarms"],
  xykFarms: ["xykFarms"],
  stoppedXykFarms: (address?: string) => ["stoppedXykFarms", address],
  totalIssuances: ["totalIssuances"],
  tokenBalance: (
    id: Maybe<string | u32>,
    address: Maybe<AccountId32 | string>,
  ) => ["tokenBalance", id?.toString(), address],
  tokenBalanceLive: (
    id: Maybe<string | u32>,
    address: Maybe<AccountId32 | string>,
  ) => [QUERY_KEY_PREFIX, "tokenBalance", id?.toString(), address],
  spotPriceLive: (assetA: string, assetB: string) => [
    QUERY_KEY_PREFIX,
    "spotPrice",
    assetA,
    assetB,
  ],
  oraclePrice: (
    rewardCurrency: Maybe<string>,
    incentivizedAsset: Maybe<string>,
  ) => [QUERY_KEY_PREFIX, "oraclePrice", rewardCurrency, incentivizedAsset],
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
  nextEvmPermitNonce: (account: Maybe<AccountId32 | string>) => [
    "evmPermitNonce",
    account?.toString(),
  ],
  pendingEvmPermit: (account: Maybe<AccountId32 | string>) => [
    "pendingEvmPermit",
    account?.toString(),
  ],
  mathLoyaltyRates: (
    plannedYieldingPeriods: string,
    initialRewardPercentage: Maybe<string>,
    scaleCoef: Maybe<string>,
    periodsInFarm: Maybe<string>,
  ) => [
    "mathLoyaltyRates",
    plannedYieldingPeriods,
    initialRewardPercentage?.toString(),
    scaleCoef?.toString(),
    periodsInFarm,
  ],
  minWithdrawalFee: ["minWithdrawalFee"],
  allTrades: (assetId?: number) => ["allTrades", assetId],
  allOmnipoolTrades: ["allOmnipoolTrades"],
  allStableswapTrades: ["allStableswapTrades"],
  xykSquidVolumes: (addresses: string[]) => [
    "xykSquidVolumes",
    addresses.join(","),
  ],
  omnipoolSquidVolumes: ["omnipoolSquidVolumes"],
  stablepoolsSquidVolumes: ["stablepoolsSquidVolumes"],
  timestamp: (bestNumber: Maybe<u32 | BigNumber>) =>
    bestNumber != null
      ? ["timestamp", bestNumber]
      : [QUERY_KEY_PREFIX, "timestamp"],
  vestingSchedules: (address: Maybe<AccountId32 | string>) => [
    "vestingSchedules",
    address,
  ],
  vestingLockBalance: (address: Maybe<AccountId32 | string>) => [
    "vestingLock",
    address,
  ],
  lock: (address: Maybe<AccountId32 | string>, asset: Maybe<u32 | string>) => [
    QUERY_KEY_PREFIX,
    "lock",
    address,
    asset,
  ],
  hubAssetImbalance: () => ["hubAssetImbalance"],
  omnipoolFee: ["omnipoolFee"],
  omnipoolYieldMetrics: ["omnipoolYieldMetrics"],
  omnipoolPositions: [QUERY_KEY_PREFIX, "omnipoolPositions"],
  allOmnipoolPositions: ["allOmnipoolPositions"],
  otcOrders: [QUERY_KEY_PREFIX, "otcOrders"],
  otcOrdersTable: [QUERY_KEY_PREFIX, "otcOrdersTable"],
  otcOrdersState: (orderId: Maybe<string | u32>) => [
    QUERY_KEY_PREFIX,
    "otcOrdersState",
    orderId?.toString(),
  ],
  otcExistentialDepositMultiplier: ["otcExistentialDepositMultiplier"],
  provider: ["provider"],
  providerMetadata: ["providerMetadata"],
  existentialDeposit: [QUERY_KEY_PREFIX, "existentialDeposit"],
  metadataVersion: ["metadataVersion"],
  acceptedCurrencies: (ids: string[]) => ["acceptedCurrencies", ids.join(",")],
  accountCurrency: (address: Maybe<AccountId32 | string>) => [
    "accountCurrency",
    address,
  ],
  externalWalletKey: (walletAddress: string) => [
    "externalWallet",
    walletAddress,
  ],
  polkadotAccounts: ["polkadotAccounts"],
  maxAddLiquidityLimit: ["maxAddLiquidityLimit"],
  otcFee: ["otcFee"],
  useUniqueIds: ["useUniqueIds"],
  insufficientFee: ["insufficientFee"],
  coingeckoUsd: ["coingeckoUsd"],
  polStats: ["polStats"],
  openGovReferendas: (url: string) => ["openGovReferendas", url],
  referendaTracks: (url: string) => ["referendaTracks", url],
  accountOpenGovVotes: (accountAddress?: string) => [
    "accountOpenGovVotes",
    accountAddress,
  ],
  accountOpenGovUnlockedTokens: (ids: string[], address?: string) => [
    "accountOpenGovUnlockedTokens",
    address,
    ids.join(","),
  ],
  referendums: (accountAddress?: string, type?: "ongoing" | "finished") => [
    "referendums",
    accountAddress,
    type,
  ],
  deprecatedReferendumInfo: (id: string) => [id, "deprecatedReferendumInfo"],
  referendumVotes: (accountAddress?: string) => [
    QUERY_KEY_PREFIX,
    "referendumVotes",
    accountAddress,
  ],
  referendumInfo: (id: string) => [id, "referendumInfo"],
  stats: (
    type: ChartType,
    timeframe?: StatsTimeframe,
    assetSymbol?: string,
  ) => {
    const key = ["stats", type]

    if (timeframe) key.push(timeframe)
    if (assetSymbol) key.push(assetSymbol)

    return key
  },
  hdxSupply: ["hdxSupply"],
  treasuryBalances: ["treasuryBalances"],
  stake: (address: string | undefined) => ["stake", address],
  minStake: ["minStake"],
  staking: ["staking"],
  stakingPosition: (id: number | undefined) => ["totalStaking", id],
  stakingConsts: ["stakingConsts"],
  stakingEvents: ["stakingEvents"],
  processedVotes: (address?: string) => ["processedVotes", address],
  stableswapPools: ["stableswapPools"],
  stableswapPool: (id?: string) => ["stableswapPool", id],
  lbpPool: ["lbpPool"],
  bondEvents: (id?: Maybe<string>, myEvents?: boolean) => [
    "bondEvents",
    id,
    !!myEvents,
  ],
  bondEventsSquid: (id?: Maybe<string>, myEvents?: boolean) => [
    "bondEvents",
    id,
    !!myEvents,
  ],
  lbpPoolTotal: (id?: Maybe<string>) => ["lbpPoolTotal", id],
  lbpAveragePrice: (poolAddress?: string) => ["lbpAveragePrice", poolAddress],
  poolHistoricalBalance: (pool?: string, block?: number) => [
    "poolHistoricalBalance",
    pool,
    block,
  ],
  xykConsts: ["xykConsts"],
  shareTokens: (rpc: string) => ["shareTokens", rpc],
  totalXYKLiquidity: (address?: string) => [
    QUERY_KEY_PREFIX,
    "totalXYKLiquidity",
    address,
  ],
  volumeDaily: (assetId?: string) => ["volumeDaily", assetId],
  identity: (address?: string) => ["identity", address],
  evmTxCost: (data: string) => ["evmTxCost", data],
  evmChainInfo: (address: string) => ["evmChainInfo", address],
  evmAccountBinding: (address: string) => [address, "evmAccountBinding"],
  evmWalletReadiness: (address: string) => ["evmWalletReadiness", address],
  evmPaymentFee: (txHex: string, address?: string) => [
    "evmPaymentFee",
    txHex,
    address,
  ],
  evmGasPrice: () => [QUERY_KEY_PREFIX, "evmGasPrice"],
  referralCodes: (accountAddress?: string) => [
    "referralsCodes",
    accountAddress,
  ],
  referralCodeLength: ["referralCodeLength"],
  userReferrer: (accountAddress?: string) => ["userReferrer", accountAddress],
  referrerInfo: (referrerAddress?: string) => ["referrerInfo", referrerAddress],
  accountReferralShares: (accountAddress?: string) => [
    "accountReferralShares",
    accountAddress,
  ],
  referrerAddress: (referrerCode?: string) => ["referrerAddress", referrerCode],
  accountReferees: (referrerAddress?: string) => [
    "accountReferees",
    referrerAddress,
  ],
  referralLinkFee: ["referralLinkFee"],
  accountTransfers: (address: Maybe<AccountId32 | string>) => [
    "accountTransfers",
    address?.toString(),
  ],
  accountTransfersLive: (address: Maybe<AccountId32 | string>) => [
    QUERY_KEY_PREFIX,
    "accountTransfers",
    address?.toString(),
  ],
  yieldFarmCreated: ["yieldFarmCreated"],
  externalAssetRegistry: ["externalAssetRegistry"],
  assetHubAssetRegistry: ["assetHubAssetRegistry"],
  pendulumAssetRegistry: ["pendulumAssetRegistry"],
  assetHubNativeBalance: (address: Maybe<AccountId32 | string>) => [
    "assetHubNativeBalance",
    address?.toString(),
  ],
  polkadotRegistry: ["polkadotRegistry"],
  assetHubTokenBalance: (address: string, id: string) => [
    "assetHubTokenBalance",
    address,
    id,
  ],
  assetHubExistentialDeposit: (id: string) => [
    "assetHubExistentialDeposit",
    id,
  ],
  memepadDryRun: (address: string) => ["memepadDryRun", address],
  bridgeLink: (hash: string) => ["bridgeLink", hash],
  progressToast: (hash: string) => [QUERY_KEY_PREFIX, "progressToast", hash],
  xcmTransfer: (
    asset: string,
    srcAddr: string,
    srcChain: string,
    dstAddr: string,
    dstChain: string,
  ) => ["xcmTransfer", asset, srcAddr, srcChain, dstAddr, dstChain],
  externalApi: (chain: string) => ["externalApi", chain],
  externalStore: ["externalStore"],
  defillamaApyHistory: (id: string) => ["defillamaApyHistory", id],
  borrowUserSummary: (address: string) => [
    QUERY_KEY_PREFIX,
    "borrowUserSummary",
    address,
  ],
  borrowReserves: (poolContractAddress: string) => [
    "borrowReserves",
    poolContractAddress,
  ],
  borrowIncentives: (
    incentivesContractAddress: string,
    accounntAddress?: string,
  ) => ["borrowIncentives", incentivesContractAddress, accounntAddress],
  solanaAccountBalance: (address: string) => ["solanaAccountBalance", address],
  ethereumAccountBalance: (address: string) => [
    "ethereumAccountBalance",
    address,
  ],
  spotPriceKey: (assetId: string) => ["spotPriceKey", assetId],
  displayPrices: (stableCoinId: string | undefined) => [
    "displayPrices",
    stableCoinId,
  ],
  rpcStatus: (url: string) => ["rpcStatus", url],
  accountMoneyMarketEvents: (
    accoundId: string,
    filter: ReadonlyArray<EventName>,
    searchPhrase: string,
    pagination: PaginationState,
  ) => [
    "moneyMarketEvents",
    accoundId,
    filter,
    searchPhrase,
    pagination.pageSize,
    pagination.pageIndex,
  ],
  swapAssetFees: (period: string) => ["swapAssetFees", period],
  bestTradeSell: (assetInId: string, assetOutId: string, amountIn: string) => [
    QUERY_KEY_PREFIX,
    "trade",
    "bestTradeSell",
    assetInId,
    assetOutId,
    amountIn,
  ],
  bestTradeSellTx: (
    assetInId: string,
    assetOutId: string,
    amountIn: string,
  ) => ["bestTradeSellTx", assetInId, assetOutId, amountIn],
} as const

export const WS_QUERY_KEYS = {
  omnipoolAssets: ["omnipoolAssets_"],
  xcmBalance: (address: string, chain: string) => [
    "xcmBalance_",
    address,
    chain,
  ],
}
