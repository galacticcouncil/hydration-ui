import type { Address } from "viem"
import { encodeFunctionData } from "viem"

import { poolAbi } from "@/core/abi"
import type {
  ActionPlan,
  EvmCall,
  GasHints,
  IsolationJoin,
  MarketDescriptor,
} from "@/types"

/**
 * Builds the pool's state-changing actions as ordered lists of plain calls.
 *
 * Nothing here touches a network, reads an allowance or estimates gas, so no
 * builder has a failure mode: given arguments that typecheck, each returns a
 * plan (ADR-0007). Amounts are raw base units, or `MAX_UINT_AMOUNT` when the
 * caller means "all of it" — this module never resolves a max against a
 * balance.
 *
 * Every plan is one call except an isolation join, whose collateral switches
 * have to land around the supply in one order (see `buildSupply`).
 *
 * Every call carries a default `gasLimit`, so every signing path works without
 * live estimation. A caller's `gas` overrides it key by key.
 */

/** The pool's variable interest rate mode. Stable-rate borrowing is cut. */
const VARIABLE_INTEREST_RATE_MODE = 2n

/** Aave's referral programme is disabled; the pool ignores a non-zero code. */
const NO_REFERRAL = 0

/** The gas limit each pool action carries unless the caller passes its own. */
const DEFAULT_GAS_LIMIT = {
  supply: 1_000_000n,
  withdraw: 1_000_000n,
  borrow: 1_300_000n,
  repay: 1_000_000n,
  repayWithATokens: 1_000_000n,
  setUserUseReserveAsCollateral: 1_000_000n,
  setUserEMode: 1_000_000n,
} as const satisfies Partial<
  Record<
    Extract<(typeof poolAbi)[number], { type: "function" }>["name"],
    bigint
  >
>

type PoolFunctionName = keyof typeof DEFAULT_GAS_LIMIT

/**
 * Encodes one pool call, carrying the ABI item it encoded. `abi` is narrowed to
 * that single item so a consumer decoding the call cannot match the calldata
 * against a function this plan did not build.
 */
const poolCall = (
  market: MarketDescriptor,
  functionName: PoolFunctionName,
  args: readonly unknown[],
  gas?: GasHints,
): EvmCall => ({
  to: market.addresses.POOL,
  data: encodeFunctionData({
    abi: poolAbi,
    functionName,
    args,
  } as Parameters<typeof encodeFunctionData>[0]),
  abi: poolAbi.filter((item) => item.name === functionName),
  functionName,
  args,
  ...gas,
  gasLimit: gas?.gasLimit ?? DEFAULT_GAS_LIMIT[functionName],
})

/** What every pool action needs: which market, and optional gas overrides. */
type PoolRequest = {
  market: MarketDescriptor
  gas?: GasHints
}

/** An action against one reserve's underlying asset. */
type AssetAmountRequest = PoolRequest & {
  /** The reserve's underlying asset, never its aToken or debt token. */
  asset: Address
  /** Raw base units, or `MAX_UINT_AMOUNT`. */
  amount: bigint
}

export type SupplyRequest = AssetAmountRequest & {
  /** Who ends up holding the aTokens. */
  onBehalfOf: Address
  /** From `assessSupply`, when the asset is isolated and joins other collateral. */
  isolationJoin?: IsolationJoin
}

/**
 * Supplies `amount` of `asset`, crediting `onBehalfOf` with the aTokens.
 *
 * With `isolationJoin`, the other collateral is switched off first — the pool
 * refuses an isolated asset as collateral beside anything else — and the
 * supplied asset switched on last, since the pool never enables an isolated
 * asset as collateral on a plain supplier's behalf.
 */
export const buildSupply = ({
  market,
  asset,
  amount,
  onBehalfOf,
  isolationJoin,
  gas,
}: SupplyRequest): ActionPlan => {
  const supply = poolCall(
    market,
    "supply",
    [asset, amount, onBehalfOf, NO_REFERRAL],
    gas,
  )

  if (!isolationJoin) return [supply]

  return [
    ...isolationJoin.disableCollateral.map((collateral) =>
      poolCall(
        market,
        "setUserUseReserveAsCollateral",
        [collateral, false],
        gas,
      ),
    ),
    supply,
    poolCall(market, "setUserUseReserveAsCollateral", [asset, true], gas),
  ]
}

export type WithdrawRequest = AssetAmountRequest & {
  /** Who receives the underlying. */
  to: Address
}

/** Withdraws `amount` of `asset`, burning the caller's aTokens. */
export const buildWithdraw = ({
  market,
  asset,
  amount,
  to,
  gas,
}: WithdrawRequest): ActionPlan => [
  poolCall(market, "withdraw", [asset, amount, to], gas),
]

export type BorrowRequest = AssetAmountRequest & {
  /** Whose collateral backs the debt. */
  onBehalfOf: Address
}

/** Borrows `amount` of `asset` against `onBehalfOf`'s collateral. */
export const buildBorrow = ({
  market,
  asset,
  amount,
  onBehalfOf,
  gas,
}: BorrowRequest): ActionPlan => [
  poolCall(
    market,
    "borrow",
    [asset, amount, VARIABLE_INTEREST_RATE_MODE, NO_REFERRAL, onBehalfOf],
    gas,
  ),
]

export type RepayRequest = AssetAmountRequest & {
  /** Whose debt is repaid. */
  onBehalfOf: Address
}

/** Repays `amount` of `onBehalfOf`'s debt in `asset`, from the wallet. */
export const buildRepay = ({
  market,
  asset,
  amount,
  onBehalfOf,
  gas,
}: RepayRequest): ActionPlan => [
  poolCall(
    market,
    "repay",
    [asset, amount, VARIABLE_INTEREST_RATE_MODE, onBehalfOf],
    gas,
  ),
]

export type RepayWithATokensRequest = AssetAmountRequest

/**
 * Repays the caller's own debt in `asset` out of their aTokens. The pool takes
 * no `onBehalfOf` here — aTokens can only be spent by whoever holds them.
 */
export const buildRepayWithATokens = ({
  market,
  asset,
  amount,
  gas,
}: RepayWithATokensRequest): ActionPlan => [
  poolCall(
    market,
    "repayWithATokens",
    [asset, amount, VARIABLE_INTEREST_RATE_MODE],
    gas,
  ),
]

export type SetUsageAsCollateralRequest = PoolRequest & {
  asset: Address
  useAsCollateral: boolean
}

/** Turns the caller's supply of `asset` into collateral, or out of it. */
export const buildSetUsageAsCollateral = ({
  market,
  asset,
  useAsCollateral,
  gas,
}: SetUsageAsCollateralRequest): ActionPlan => [
  poolCall(
    market,
    "setUserUseReserveAsCollateral",
    [asset, useAsCollateral],
    gas,
  ),
]

export type SetUserEModeRequest = PoolRequest & {
  /** The e-mode category to enter, or `0` to leave e-mode entirely. */
  categoryId: number
}

/** Moves the caller into an e-mode category, or out of one. */
export const buildSetUserEMode = ({
  market,
  categoryId,
  gas,
}: SetUserEModeRequest): ActionPlan => [
  poolCall(market, "setUserEMode", [categoryId], gas),
]
