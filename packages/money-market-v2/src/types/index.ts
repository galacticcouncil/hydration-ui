import { Address } from "viem"

/**
 * The vocabulary of CONTEXT.md, expressed as types.
 *
 * The one boundary that matters is where a value came from (ADR-0001):
 * `Reserve` and `Position` are decoded, validated chain state; `ReserveSummary`,
 * `PositionSummary` and `Account` are values computed from it. `Account` exists
 * only on the derived side, because a health factor has no on-chain counterpart.
 *
 * Assets are identified by EVM address (ADR-0003) — no Hydration asset id
 * appears anywhere below. Stable-rate borrowing is cut, so no stable-rate field
 * is modelled. The stablecoin is Hollar, never GHO (ADR-0002).
 *
 * Numeric values on the chain side are raw base-unit decimal strings; on the
 * derived side they are plain fixed-point decimal strings in human units
 * (ADR-0006). Neither side carries `bigint` or `Big` — both are converted at
 * the boundary that produces them.
 */

/** Opaque key for one deployed lending pool. A chain id never identifies one. */
export type CustomMarket =
  | "hydration_v3"
  | "hydration_testnet_v3"
  | "bil_v3"
  | "gigahdx_v3"

/** The seven contracts v2 reads from or writes to for a single market. */
export type MarketAddresses = {
  POOL_ADDRESSES_PROVIDER: Address
  POOL: Address
  UI_POOL_DATA_PROVIDER: Address
  UI_INCENTIVE_DATA_PROVIDER: Address
  WALLET_BALANCE_PROVIDER: Address
  HOLLAR_TOKEN: Address
  HOLLAR_UI_DATA_PROVIDER: Address
}

/** Everything needed to address one market. Carries no chain id by design. */
export type MarketDescriptor = {
  market: CustomMarket
  marketTitle: string
  addresses: MarketAddresses
}

/* -------------------------------------------------------------------------- */
/* Chain state — what the contracts said                                       */
/* -------------------------------------------------------------------------- */

/** Prices the market quotes its reference currency in. */
export type BaseCurrency = {
  marketReferenceCurrencyDecimals: number
  marketReferenceCurrencyPriceInUsd: string
  networkBaseTokenPriceInUsd: string
  networkBaseTokenPriceDecimals: number
}

/** A single asset within a market, on the terms the pool reports for it. */
export type Reserve = {
  underlyingAsset: Address
  name: string
  symbol: string
  decimals: number
  aTokenAddress: Address
  variableDebtTokenAddress: Address
  interestRateStrategyAddress: Address

  baseLTVasCollateral: string
  reserveLiquidationThreshold: string
  reserveLiquidationBonus: string
  reserveFactor: string

  usageAsCollateralEnabled: boolean
  borrowingEnabled: boolean
  flashLoanEnabled: boolean
  isActive: boolean
  isFrozen: boolean
  isPaused: boolean

  liquidityIndex: string
  variableBorrowIndex: string
  liquidityRate: string
  variableBorrowRate: string
  lastUpdateTimestamp: number

  availableLiquidity: string
  totalScaledVariableDebt: string
  unbacked: string
  priceInMarketReferenceCurrency: string

  supplyCap: string
  borrowCap: string
  debtCeiling: string
  debtCeilingDecimals: number
  isolationModeTotalDebt: string
  borrowableInIsolation: boolean
  isSiloedBorrowing: boolean

  eModeCategoryId: number
  eModeLabel: string
  eModeLtv: number
  eModeLiquidationThreshold: number
  eModeLiquidationBonus: number
}

/** One reward emission configured on one side of one reserve. */
export type IncentiveEmission = {
  rewardTokenSymbol: string
  rewardTokenAddress: Address
  rewardOracleAddress: Address
  emissionPerSecond: string
  incentivesLastUpdateTimestamp: number
  tokenIncentivesIndex: string
  emissionEndTimestamp: number
  rewardPriceFeed: string
  rewardTokenDecimals: number
  precision: number
  priceFeedDecimals: number
}

/**
 * The emissions configured against one incentivised token — an aToken for the
 * supply side, a variable debt token for the borrow side. The controller is
 * recorded here rather than on the market descriptor because a claim is made
 * against whichever controller the reward itself names.
 */
export type IncentiveSide = {
  tokenAddress: Address
  incentiveControllerAddress: Address
  emissions: IncentiveEmission[]
}

/** Both incentivised sides of one reserve. Stable-side incentives are cut. */
export type ReserveIncentives = {
  underlyingAsset: Address
  supply: IncentiveSide
  variableBorrow: IncentiveSide
}

/** Everything one reserves read returns for a market. */
export type MarketReserves = {
  reserves: Reserve[]
  baseCurrency: BaseCurrency
  incentives: ReserveIncentives[]
}

/** What one user has supplied to and borrowed from one reserve. */
export type Position = {
  underlyingAsset: Address
  scaledATokenBalance: string
  scaledVariableDebt: string
  usageAsCollateralEnabledOnUser: boolean
}

/**
 * Everything one positions read returns for a user in a market. An empty
 * `positions` array is an ordinary result — it is what a market with reserves
 * reports for an address that has never interacted with it.
 */
export type MarketPositions = {
  user: Address
  positions: Position[]
  eModeCategoryId: number
}

/* -------------------------------------------------------------------------- */
/* Derived values — computed from chain state                                  */
/* -------------------------------------------------------------------------- */

/**
 * One reward emission's rate on one side of one reserve. Reported per reward
 * and never composed into a net APY (ADR-0005, ADR-0009); the incentive
 * controller address comes from the reward payload, not the market descriptor.
 */
export type IncentiveApr = {
  rewardTokenAddress: Address
  rewardTokenSymbol: string
  incentiveControllerAddress: Address
  rewardApr: string
  rewardPriceInUsd: string
}

/** What a user has accrued in one reward token and can claim. */
export type ClaimableReward = {
  rewardTokenAddress: Address
  rewardTokenSymbol: string
  incentiveControllerAddress: Address
  amount: string
  amountUsd: string
}

/** A reserve's rates, caps and USD values at one instant. */
export type ReserveSummary = {
  underlyingAsset: Address
  name: string
  symbol: string

  supplyApr: string
  supplyApy: string
  variableBorrowApr: string
  variableBorrowApy: string
  supplyUsageRatio: string
  borrowUsageRatio: string

  totalLiquidity: string
  totalLiquidityUsd: string
  availableLiquidity: string
  availableLiquidityUsd: string
  totalDebt: string
  totalDebtUsd: string
  unbacked: string
  unbackedUsd: string

  priceInMarketReferenceCurrency: string
  priceInUsd: string

  ltv: string
  liquidationThreshold: string
  liquidationBonus: string
  reserveFactor: string

  supplyCap: string
  supplyCapUsd: string
  borrowCap: string
  borrowCapUsd: string
  debtCeiling: string
  debtCeilingUsd: string
  isolationModeTotalDebtUsd: string
  availableDebtCeilingUsd: string

  usageAsCollateralEnabled: boolean
  borrowingEnabled: boolean
  flashLoanEnabled: boolean
  isActive: boolean
  isFrozen: boolean
  isPaused: boolean
  isIsolated: boolean
  borrowableInIsolation: boolean
  isSiloedBorrowing: boolean

  eModeCategoryId: number
  eModeLabel: string
  eModeLtv: string
  eModeLiquidationThreshold: string
  eModeLiquidationBonus: string

  supplyIncentives: IncentiveApr[]
  borrowIncentives: IncentiveApr[]
}

/** One user's standing in one reserve, in human units. */
export type PositionSummary = {
  underlyingAsset: Address
  symbol: string
  usageAsCollateralEnabledOnUser: boolean

  underlyingBalance: string
  underlyingBalanceMarketReferenceCurrency: string
  underlyingBalanceUsd: string

  variableBorrows: string
  variableBorrowsMarketReferenceCurrency: string
  variableBorrowsUsd: string

  rewards: ClaimableReward[]
}

/**
 * A user's standing across every position in a market. Always derived — there
 * is no `Account` without a user, which is why `healthFactor` of `"-1"` means
 * only "no debt, so the health factor is unbounded" and never "no user"
 * (ADR-0006).
 */
export type Account = {
  address: Address

  healthFactor: string

  totalLiquidityMarketReferenceCurrency: string
  totalLiquidityUsd: string
  totalCollateralMarketReferenceCurrency: string
  totalCollateralUsd: string
  totalBorrowsMarketReferenceCurrency: string
  totalBorrowsUsd: string
  netWorthUsd: string

  availableBorrowsMarketReferenceCurrency: string
  availableBorrowsUsd: string
  currentLoanToValue: string
  currentLiquidationThreshold: string

  eModeCategoryId: number

  isInIsolationMode: boolean
  isolatedReserve: Address | null
}
