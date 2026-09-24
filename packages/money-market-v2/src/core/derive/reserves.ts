import type Big from "big.js"

import { Decimal, normalize, shift } from "@/core/big"
import {
  LTV_PRECISION,
  RAY_DECIMALS,
  SECONDS_PER_YEAR,
  USD_DECIMALS,
} from "@/core/constants"
import { incentiveAprs } from "@/core/derive/incentives"
import { calculateCompoundedRate } from "@/core/derive/pool-math"
import { reserveTotals } from "@/core/derive/reserve-totals"
import type {
  BaseCurrency,
  Reserve,
  ReserveIncentives,
  ReserveSummary,
} from "@/types"

/**
 * Turns decoded chain state into what a reserve actually offers at one instant:
 * rates, utilisation, USD values, caps and the isolation/e-mode flags.
 *
 * Three things it deliberately does not do:
 *
 * - **No net APY.** Base APY and incentive APRs are reported separately and
 *   never composed, because they are denominated in different assets and a
 *   single number hides which one moved (ADR-0005, ADR-0009).
 * - **No APY override.** v1 overwrites Aave's rate with an app-supplied yield
 *   for some reserves; v2 reports what the interest-rate model says and leaves
 *   composition to the app (ADR-0005). Expect a divergence from the live UI on
 *   an overridden reserve — that is the design, not a porting bug.
 * - **No clock read.** Interest is accrued to the timestamp the caller passes
 *   (ADR-0004).
 *
 * Every number out is a plain fixed-point decimal string in human units,
 * produced with `toFixed` so no exponent notation can leak (ADR-0006).
 */
export type SummarizeReservesRequest = {
  reserves: Reserve[]
  baseCurrency: BaseCurrency
  /**
   * Reward emissions for these reserves, so a summary and its reward rates can
   * never come from different blocks. They stay a separate list of per-reward
   * APRs on the summary and are never folded into the base APY.
   */
  incentives: ReserveIncentives[]
  /** Unix seconds to accrue interest to. */
  currentTimestamp: number
}

export function summarizeReserves({
  reserves,
  baseCurrency,
  incentives,
  currentTimestamp,
}: SummarizeReservesRequest): ReserveSummary[] {
  return reserves.map((reserve) =>
    summarizeReserve(
      reserve,
      baseCurrency,
      incentives.find(
        (candidate) => candidate.underlyingAsset === reserve.underlyingAsset,
      ),
      currentTimestamp,
    ),
  )
}

function summarizeReserve(
  reserve: Reserve,
  baseCurrency: BaseCurrency,
  incentives: ReserveIncentives | undefined,
  currentTimestamp: number,
): ReserveSummary {
  const { decimals } = reserve
  const { marketReferenceCurrencyDecimals } = baseCurrency

  const marketReferencePriceInUsd = shift(
    Decimal(baseCurrency.marketReferenceCurrencyPriceInUsd),
    -USD_DECIMALS,
  )

  /** Base units of this reserve's asset into USD, at the market's own price. */
  const toUsd = (baseUnits: Big): Big =>
    shift(
      baseUnits
        .times(reserve.priceInMarketReferenceCurrency)
        .times(marketReferencePriceInUsd),
      -(decimals + marketReferenceCurrencyDecimals),
    )

  /** A cap is stored in whole tokens, so it has to be scaled up to compare. */
  const capToUsd = (wholeTokens: string): Big =>
    toUsd(shift(Decimal(wholeTokens), decimals))

  const { totalDebt, totalLiquidity } = reserveTotals(reserve, currentTimestamp)
  const unbacked = BigInt(reserve.unbacked)

  /**
   * The helper reports unborrowed tokens; what can actually be borrowed is also
   * bounded by the borrow cap, which is exclusive — hence the extra unit.
   */
  const borrowCap = BigInt(reserve.borrowCap)
  const headroom = borrowCap * 10n ** BigInt(decimals) - (totalDebt + 1n)
  const availableLiquidity =
    borrowCap === 0n
      ? BigInt(reserve.availableLiquidity)
      : min(BigInt(reserve.availableLiquidity), headroom)

  const isIsolated = reserve.debtCeiling !== "0"
  const ceilingDecimals = reserve.debtCeilingDecimals

  const supplyApy = calculateCompoundedRate({
    rate: BigInt(reserve.liquidityRate),
    duration: SECONDS_PER_YEAR,
  })
  const variableBorrowApy = calculateCompoundedRate({
    rate: BigInt(reserve.variableBorrowRate),
    duration: SECONDS_PER_YEAR,
  })

  return {
    underlyingAsset: reserve.underlyingAsset,
    name: reserve.name,
    symbol: reserve.symbol,

    supplyApr: normalize(reserve.liquidityRate, RAY_DECIMALS),
    supplyApy: normalize(supplyApy.toString(), RAY_DECIMALS),
    variableBorrowApr: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
    variableBorrowApy: normalize(variableBorrowApy.toString(), RAY_DECIMALS),
    // Both ratios are guarded on liquidity, not on their own denominator: with
    // no liquidity there is no debt either, and unbacked supply alone is not
    // utilisation.
    supplyUsageRatio:
      totalLiquidity === 0n
        ? "0"
        : divide(totalDebt, totalLiquidity + unbacked),
    borrowUsageRatio:
      totalLiquidity === 0n ? "0" : divide(totalDebt, totalLiquidity),

    baseVariableBorrowRate: normalize(
      reserve.baseVariableBorrowRate,
      RAY_DECIMALS,
    ),
    variableRateSlope1: normalize(reserve.variableRateSlope1, RAY_DECIMALS),
    variableRateSlope2: normalize(reserve.variableRateSlope2, RAY_DECIMALS),
    optimalUsageRatio: normalize(reserve.optimalUsageRatio, RAY_DECIMALS),

    totalLiquidity: normalize(totalLiquidity.toString(), decimals),
    totalLiquidityUsd: toUsd(Decimal(totalLiquidity.toString())).toFixed(),
    availableLiquidity: normalize(availableLiquidity.toString(), decimals),
    availableLiquidityUsd: toUsd(
      Decimal(availableLiquidity.toString()),
    ).toFixed(),
    totalDebt: normalize(totalDebt.toString(), decimals),
    totalDebtUsd: toUsd(Decimal(totalDebt.toString())).toFixed(),
    unbacked: normalize(reserve.unbacked, decimals),
    // Upstream's `unbackedUSD` omits this decimals shift, which is a bug on any
    // reserve that has unbacked supply; v2 converts it like every other amount.
    unbackedUsd: toUsd(Decimal(reserve.unbacked)).toFixed(),

    priceInMarketReferenceCurrency: normalize(
      reserve.priceInMarketReferenceCurrency,
      marketReferenceCurrencyDecimals,
    ),
    priceInUsd: toUsd(shift(Decimal(1), decimals)).toFixed(),

    ltv: normalize(reserve.baseLTVasCollateral, LTV_PRECISION),
    liquidationThreshold: normalize(
      reserve.reserveLiquidationThreshold,
      LTV_PRECISION,
    ),
    // A bonus is stored as a multiplier, e.g. 10500 for a five percent bonus.
    liquidationBonus: bonus(reserve.reserveLiquidationBonus),
    reserveFactor: normalize(reserve.reserveFactor, LTV_PRECISION),

    supplyCap: Decimal(reserve.supplyCap).toFixed(),
    supplyCapUsd: capToUsd(reserve.supplyCap).toFixed(),
    borrowCap: Decimal(reserve.borrowCap).toFixed(),
    borrowCapUsd: capToUsd(reserve.borrowCap).toFixed(),

    // The ceiling and the debt against it are already denominated in USD.
    debtCeiling: normalize(reserve.debtCeiling, ceilingDecimals),
    debtCeilingUsd: isIsolated
      ? normalize(reserve.debtCeiling, ceilingDecimals)
      : "0",
    isolationModeTotalDebtUsd: isIsolated
      ? normalize(reserve.isolationModeTotalDebt, ceilingDecimals)
      : "0",
    availableDebtCeilingUsd: isIsolated
      ? normalize(
          Decimal(reserve.debtCeiling).minus(reserve.isolationModeTotalDebt),
          ceilingDecimals,
        )
      : "0",

    usageAsCollateralEnabled: reserve.usageAsCollateralEnabled,
    borrowingEnabled: reserve.borrowingEnabled,
    flashLoanEnabled: reserve.flashLoanEnabled,
    isActive: reserve.isActive,
    isFrozen: reserve.isFrozen,
    isPaused: reserve.isPaused,
    isIsolated,
    borrowableInIsolation: reserve.borrowableInIsolation,
    isSiloedBorrowing: reserve.isSiloedBorrowing,

    eModeCategoryId: reserve.eModeCategoryId,
    eModeLabel: reserve.eModeLabel,
    eModeLtv: normalize(reserve.eModeLtv, LTV_PRECISION),
    eModeLiquidationThreshold: normalize(
      reserve.eModeLiquidationThreshold,
      LTV_PRECISION,
    ),
    eModeLiquidationBonus: bonus(reserve.eModeLiquidationBonus),

    // Per reward and never composed with the base APY (ADR-0005, ADR-0009).
    supplyIncentives: incentives
      ? incentiveAprs({
          reserve,
          side: incentives.supply,
          totalTokenSupply: totalLiquidity,
          priceInMarketReferenceCurrency:
            reserve.priceInMarketReferenceCurrency,
          marketReferenceCurrencyDecimals,
          marketReferencePriceInUsd,
          currentTimestamp,
        })
      : [],
    borrowIncentives: incentives
      ? incentiveAprs({
          reserve,
          side: incentives.variableBorrow,
          totalTokenSupply: totalDebt,
          priceInMarketReferenceCurrency:
            reserve.priceInMarketReferenceCurrency,
          marketReferenceCurrencyDecimals,
          marketReferencePriceInUsd,
          currentTimestamp,
        })
      : [],
  }
}

const isOpen = (reserve: ReserveSummary) =>
  reserve.isActive && !reserve.isFrozen && !reserve.isPaused

/**
 * Whether supplying `collateral` can back a new borrow of `borrowed`, judged on
 * the two reserves' configuration alone.
 *
 * It says nothing about a particular account: e-mode, an account's isolation
 * state and its health factor can each narrow the answer further, and none of
 * them is known here. A reserve can be borrowed against itself.
 */
export const canBorrowAgainst = (
  collateral: ReserveSummary,
  borrowed: ReserveSummary,
): boolean =>
  isOpen(collateral) &&
  isOpen(borrowed) &&
  collateral.usageAsCollateralEnabled &&
  Decimal(collateral.ltv).gt(0) &&
  borrowed.borrowingEnabled &&
  (!collateral.isIsolated || borrowed.borrowableInIsolation)

function min(a: bigint, b: bigint): bigint {
  return a < b ? a : b
}

/** A quotient of two base-unit integers, at the shared twenty-place precision. */
function divide(numerator: bigint, denominator: bigint): string {
  return Decimal(numerator.toString()).div(denominator.toString()).toFixed()
}

/** A liquidation bonus is the multiplier over par; report just the premium. */
function bonus(value: string | number): string {
  return normalize(Decimal(value).minus(10 ** LTV_PRECISION), LTV_PRECISION)
}
