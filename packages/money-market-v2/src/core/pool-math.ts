/**
 * Aave's balance, interest and health-factor primitives.
 *
 * Everything that stays inside the ray/wad integer domain is `bigint`; the
 * functions whose results are genuinely fractional — health factor, borrowing
 * power, reference-currency and USD values — are Big.js (ADR-0006). Nothing
 * here reads a clock: every rate is evaluated at a timestamp the caller passes
 * (ADR-0004).
 *
 * `getCompoundedStableBalance` is deliberately absent — stable-rate borrowing
 * is cut.
 */

import Big, { BigSource } from "big.js"

import { LTV_PRECISION, SECONDS_PER_YEAR } from "@/core/constants"
import {
  binomialApproximatedRayPow,
  RAY,
  rayDiv,
  rayMul,
  rayToWad,
  wadToRay,
} from "@/core/ray-math"

/**
 * Big.js is configured per constructor rather than globally, so nothing in this
 * package can be perturbed by — or perturb — `Big.DP` / `Big.RM` elsewhere.
 *
 * `Decimal` divides at twenty places, half up, matching the BigNumber.js
 * defaults the blueprint's quotients were produced under. `Integer` is the
 * blueprint's `BigNumberZeroDecimal`: quotients truncate to whole units, as the
 * contracts do.
 */
const Decimal = Big()
Decimal.DP = 20
Decimal.RM = Big.roundHalfUp

const Integer = Big()
Integer.DP = 0
Integer.RM = Big.roundDown

/**
 * Moves the decimal point exactly, the way BigNumber.js's `shiftedBy` does.
 * Dividing by a power of ten would round instead, and these shifts only change
 * the unit a value is expressed in.
 */
function shift(value: Big, places: number): Big {
  const [mantissa, exponent] = value.toExponential().split("e")
  return new Big(`${mantissa}e${Number(exponent) + places}`)
}

type InterestRequest = {
  rate: bigint
  currentTimestamp: number
  lastUpdateTimestamp: number
}

export function calculateCompoundedInterest({
  rate,
  currentTimestamp,
  lastUpdateTimestamp,
}: InterestRequest): bigint {
  const timeDelta = BigInt(currentTimestamp - lastUpdateTimestamp)
  const ratePerSecond = rate / SECONDS_PER_YEAR

  return binomialApproximatedRayPow(ratePerSecond, timeDelta)
}

export function calculateLinearInterest({
  rate,
  currentTimestamp,
  lastUpdateTimestamp,
}: InterestRequest): bigint {
  const timeDelta = wadToRay(BigInt(currentTimestamp - lastUpdateTimestamp))
  const timeDeltaInSeconds = rayDiv(timeDelta, wadToRay(SECONDS_PER_YEAR))

  return rayMul(rate, timeDeltaInSeconds) + RAY
}

type CompoundedBalanceRequest = {
  principalBalance: bigint
  reserveIndex: bigint
  reserveRate: bigint
  currentTimestamp: number
  lastUpdateTimestamp: number
}

export function getCompoundedBalance({
  principalBalance,
  reserveIndex,
  reserveRate,
  currentTimestamp,
  lastUpdateTimestamp,
}: CompoundedBalanceRequest): bigint {
  if (principalBalance === 0n) return 0n

  const compoundedInterest = calculateCompoundedInterest({
    rate: reserveRate,
    currentTimestamp,
    lastUpdateTimestamp,
  })
  const cumulatedInterest = rayMul(compoundedInterest, reserveIndex)

  return rayToWad(rayMul(wadToRay(principalBalance), cumulatedInterest))
}

type ReserveNormalizedIncomeRequest = {
  rate: bigint
  index: bigint
  currentTimestamp: number
  lastUpdateTimestamp: number
}

export function getReserveNormalizedIncome({
  rate,
  index,
  currentTimestamp,
  lastUpdateTimestamp,
}: ReserveNormalizedIncomeRequest): bigint {
  if (rate === 0n) return index

  const cumulatedInterest = calculateLinearInterest({
    rate,
    currentTimestamp,
    lastUpdateTimestamp,
  })

  return rayMul(cumulatedInterest, index)
}

type LinearBalanceRequest = {
  balance: bigint
  index: bigint
  rate: bigint
  currentTimestamp: number
  lastUpdateTimestamp: number
}

export function getLinearBalance({
  balance,
  index,
  rate,
  currentTimestamp,
  lastUpdateTimestamp,
}: LinearBalanceRequest): bigint {
  return rayToWad(
    rayMul(
      wadToRay(balance),
      getReserveNormalizedIncome({
        rate,
        index,
        currentTimestamp,
        lastUpdateTimestamp,
      }),
    ),
  )
}

type HealthFactorRequest = {
  collateralBalanceMarketReferenceCurrency: BigSource
  borrowBalanceMarketReferenceCurrency: BigSource
  /** Liquidation threshold in basis points, as the contracts store it. */
  currentLiquidationThreshold: BigSource
}

/**
 * Returns `-1` when there is no debt, and `-1` means only that: the position
 * cannot be liquidated because nothing is owed. It is never the "no user"
 * sentinel — an account without a user does not exist in v2 (ADR-0006).
 */
export function calculateHealthFactorFromBalances({
  collateralBalanceMarketReferenceCurrency,
  borrowBalanceMarketReferenceCurrency,
  currentLiquidationThreshold,
}: HealthFactorRequest): Big {
  const debt = Decimal(borrowBalanceMarketReferenceCurrency)
  if (debt.eq(0)) return Decimal(-1)

  const weightedCollateral = shift(
    Decimal(collateralBalanceMarketReferenceCurrency).times(
      currentLiquidationThreshold,
    ),
    -LTV_PRECISION,
  )

  return Decimal(weightedCollateral).div(debt)
}

type HealthFactorBigUnitsRequest = Omit<
  HealthFactorRequest,
  "currentLiquidationThreshold"
> & {
  /** Liquidation threshold as a ratio, e.g. `0.83`. */
  currentLiquidationThreshold: BigSource
}

export function calculateHealthFactorFromBalancesBigUnits({
  collateralBalanceMarketReferenceCurrency,
  borrowBalanceMarketReferenceCurrency,
  currentLiquidationThreshold,
}: HealthFactorBigUnitsRequest): Big {
  return calculateHealthFactorFromBalances({
    collateralBalanceMarketReferenceCurrency,
    borrowBalanceMarketReferenceCurrency,
    // Truncating back to whole basis points is what the contracts hold.
    currentLiquidationThreshold: shift(
      Integer(currentLiquidationThreshold),
      LTV_PRECISION,
    ).round(0, Big.roundDown),
  })
}

type AvailableBorrowsRequest = {
  collateralBalanceMarketReferenceCurrency: BigSource
  borrowBalanceMarketReferenceCurrency: BigSource
  /** Loan-to-value in basis points. */
  currentLtv: BigSource
}

export function calculateAvailableBorrowsMarketReferenceCurrency({
  collateralBalanceMarketReferenceCurrency,
  borrowBalanceMarketReferenceCurrency,
  currentLtv,
}: AvailableBorrowsRequest): Big {
  if (Integer(currentLtv).eq(0)) return Integer(0)

  const available = shift(
    Integer(collateralBalanceMarketReferenceCurrency).times(currentLtv),
    -LTV_PRECISION,
  ).minus(borrowBalanceMarketReferenceCurrency)

  return available.gt(0) ? available : Integer(0)
}

type MarketReferenceCurrencyAndUsdBalanceRequest = {
  balance: BigSource
  priceInMarketReferenceCurrency: BigSource
  marketReferenceCurrencyDecimals: number
  decimals: number
  marketReferencePriceInUsdNormalized: BigSource
}

type MarketReferenceCurrencyAndUsdBalance = {
  marketReferenceCurrencyBalance: Big
  usdBalance: Big
}

/** Both values stay in base units; normalizing them is the caller's job. */
export function getMarketReferenceCurrencyAndUsdBalance({
  balance,
  priceInMarketReferenceCurrency,
  marketReferenceCurrencyDecimals,
  decimals,
  marketReferencePriceInUsdNormalized,
}: MarketReferenceCurrencyAndUsdBalanceRequest): MarketReferenceCurrencyAndUsdBalance {
  const marketReferenceCurrencyBalance = shift(
    Integer(balance).times(priceInMarketReferenceCurrency),
    -decimals,
  )
  const usdBalance = shift(
    marketReferenceCurrencyBalance.times(marketReferencePriceInUsdNormalized),
    -marketReferenceCurrencyDecimals,
  )

  return { marketReferenceCurrencyBalance, usdBalance }
}
