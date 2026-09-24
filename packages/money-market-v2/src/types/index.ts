import { Abi, Address, Hex } from "viem"

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
export type CustomMarket = "hydration_v3" | "bil_v3" | "gigahdx_v3"

/** The six contracts v2 reads from or writes to for a single market. */
export type MarketAddresses = {
  POOL_ADDRESSES_PROVIDER: Address
  POOL: Address
  UI_POOL_DATA_PROVIDER: Address
  UI_INCENTIVE_DATA_PROVIDER: Address
  WALLET_BALANCE_PROVIDER: Address
  HOLLAR_TOKEN: Address
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

  baseVariableBorrowRate: string
  variableRateSlope1: string
  variableRateSlope2: string
  optimalUsageRatio: string

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

/** What one user has accrued against one reward token on one incentivised side. */
export type UserRewardState = {
  rewardTokenSymbol: string
  rewardTokenAddress: Address
  rewardOracleAddress: Address
  /**
   * What the controller has already booked for this user in this reward token.
   * It is accumulated per controller, not per reserve, so the same figure is
   * repeated on every reserve entry and must be counted once.
   */
  userUnclaimedRewards: string
  tokenIncentivesUserIndex: string
  rewardPriceFeed: string
  priceFeedDecimals: number
  rewardTokenDecimals: number
}

/** One user's reward state against one incentivised token. */
export type UserIncentiveSide = {
  tokenAddress: Address
  incentiveControllerAddress: Address
  rewards: UserRewardState[]
}

/** One user's reward state on both sides of one reserve. */
export type UserReserveIncentives = {
  underlyingAsset: Address
  supply: UserIncentiveSide
  variableBorrow: UserIncentiveSide
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

/**
 * How much of one reserve's underlying asset a user holds in their wallet — the
 * ceiling on what they can supply.
 *
 * `amount` is a human-unit fixed-point string, which makes this the one chain
 * read whose result is not in raw base units. The wallet balance provider
 * reports amounts with no decimals alongside them, so the read has to join
 * against the market's reserves to mean anything at all; once that join has
 * happened there is nothing left to derive from a base-unit balance, and
 * carrying one forward would only invite a second, unjoined conversion.
 */
export type WalletBalance = {
  underlyingAsset: Address
  amount: string
}

/**
 * Everything one wallet balance read returns for a user in a market. A reserve
 * the user holds none of is still listed, with a zero amount — the provider
 * answers for every reserve of the pool.
 */
export type MarketWalletBalances = {
  user: Address
  balances: WalletBalance[]
}

/**
 * The Hollar the pool may mint, in human units. `maxCapacity` is the real
 * borrow cap on the Hollar reserve — the pool's own `borrowCap` there is unset —
 * and `level` is how much of it is minted.
 */
export type HollarFacilitator = {
  level: string
  maxCapacity: string
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

/**
 * What a user has accrued in one reward token. The controller it names is the
 * one a claim is sent to; there is one entry per reward token, never per
 * reserve, because a controller books a user's rewards across every reserve it
 * incentivises.
 */
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

  /** The interest-rate model's parameters, as fractions like the rates above. */
  baseVariableBorrowRate: string
  variableRateSlope1: string
  variableRateSlope2: string
  optimalUsageRatio: string

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

/**
 * One e-mode category the market offers, as its member reserves report it.
 * `ltv` and `liquidationThreshold` are fractions, like `ReserveSummary.ltv`.
 */
export type EModeCategory = {
  id: number
  label: string
  ltv: string
  liquidationThreshold: string
  assets: { underlyingAsset: Address; symbol: string }[]
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

  /**
   * What this position alone has accrued since the reserve's reward index was
   * last updated. It excludes the balance the controller has already booked,
   * which is held per controller and so belongs only to the market-wide list
   * `summarizeRewards` returns — adding these up would count it once per
   * reserve.
   */
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

/* -------------------------------------------------------------------------- */
/* Action plans — what to send                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Per-call gas overrides, carried but never computed. The module estimates no
 * gas and simulates nothing, so a hint is only ever a caller's (ADR-0007). A
 * hint of `0n` is falsy downstream and already reads as absent.
 */
export type GasHints = {
  gasLimit?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

/**
 * One plain EVM call. `data` is produced by viem's `encodeFunctionData`, so the
 * ABI is known at construction and travels with the call — nothing downstream
 * has to recover it by matching method-hash prefixes.
 */
export type EvmCall = GasHints & {
  to: Address
  data: Hex
  /** The single ABI item `data` encodes, not the whole contract's. */
  abi: Abi
  functionName: string
  args: readonly unknown[]
}

/**
 * An ordered list of plain calls — the only shape an action takes (ADR-0007).
 * There is no approval step, no allowance read, no permit concept and no step
 * kinds, because approvals are not required on Hydration and whether a call is
 * permit-signed is decided by the app at signing time, not here.
 */
export type ActionPlan = EvmCall[]

/* -------------------------------------------------------------------------- */
/* Assessments — whether an action may proceed                                */
/* -------------------------------------------------------------------------- */

/**
 * What supplying an isolated asset beside other collateral takes: those
 * collateral flags off first, so the supplied asset becomes the account's only
 * collateral. The addresses are the other collateral's underlying assets.
 */
export type IsolationJoin = {
  disableCollateral: Address[]
}

/**
 * Every code an assessment can report. A code means the same thing in every
 * action, so each action adds its codes here rather than declaring its own.
 */
export type FindingCode =
  /** The projected health factor is below 1 with debt outstanding. */
  | "healthFactorBelowOne"
  /** The projected health factor is below 1.1 and would visibly drop. */
  | "healthFactorRisk"
  /** The reserve's supply cap is at least 98% used; `percent`. */
  | "supplyCapNearlyReached"
  /** The reserve's borrow cap is at least 98% used; `percent`. */
  | "borrowCapNearlyReached"
  /** The isolated reserve's debt ceiling is at least 98% used; `percent`. */
  | "debtCeilingNearlyReached"
  /** Zero-LTV collateral must be withdrawn or disabled first; `symbols`. */
  | "zeroLtvCollateralBlocks"
  /** The reserve is not active; the pool accepts no action on it. */
  | "reserveInactive"
  /** The reserve is paused; the pool accepts no action on it. */
  | "reservePaused"
  /** The reserve is frozen; it takes no new supply or borrow. */
  | "reserveFrozen"
  /** An isolated asset cannot become collateral while the account has debt. */
  | "isolationSupplyWithDebt"
  /** Supplying this isolated asset turns the other collateral off; `symbol`. */
  | "isolationJoinDisablesCollateral"
  /** The asset becomes the account's only, isolated collateral. */
  | "enteringIsolationMode"
  /** The amount exceeds what the reserve holds uncommitted to borrowers. */
  | "insufficientLiquidity"
  /** The reserve does not lend; nothing can be borrowed from it. */
  | "borrowingDisabled"
  /** The account has no collateral with an LTV to borrow against. */
  | "noCollateral"
  /** The asset is outside the account's e-mode category; `category` label. */
  | "eModeCategoryMismatch"
  /** The account is in isolation mode and the asset is not borrowable there. */
  | "notBorrowableInIsolation"
  /** Siloed debt must be the account's only debt, and it would not be. */
  | "siloedBorrowingConflict"
  /** The Hollar facilitator has no capacity left to mint. */
  | "hollarCapacityExhausted"
  /** Rates, prices and risk parameters can move the health factor later. */
  | "parameterChangesMayAffectHealthFactor"
  /** The account owes nothing of this asset; there is nothing to repay. */
  | "noDebt"
  /** The wallet cannot cover the whole debt; some of it remains. */
  | "repayLeavesDebt"
  /** The account holds none of this asset to use as collateral. */
  | "noSupply"
  /** The reserve's LTV or liquidation threshold is zero; it backs nothing. */
  | "cannotBeCollateral"
  /** Isolated collateral must be the account's only collateral. */
  | "isolationCollateralConflict"
  /** Disabling the isolated collateral takes the account out of isolation. */
  | "exitingIsolationMode"
  /** The asset starts counting towards what the account can borrow. */
  | "collateralIncreasesBorrowingPower"

/**
 * What a finding's text is filled with. Plain values only — the app formats
 * them, so no `Big`, no `bigint` and no rendered text travel in a finding.
 */
export type FindingParams = Readonly<
  Record<string, string | number | readonly string[]>
>

/**
 * One thing an assessment reports about an action (ADR-0011). Where it is shown
 * is the form's concern, not the finding's. Generic over the code so the app
 * can append codes of its own to v2's.
 */
export type Finding<Code extends string = FindingCode> =
  | { kind: "blocker"; code: Code; params: FindingParams }
  | { kind: "acknowledgement"; code: Code; params: FindingParams }
  | {
      kind: "notice"
      tone: "warning" | "info"
      code: Code
      params: FindingParams
    }
