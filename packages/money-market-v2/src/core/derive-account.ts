import type Big from "big.js"

import { Decimal, Integer, normalize, shift } from "@/core/big"
import { LTV_PRECISION, USD_DECIMALS } from "@/core/constants"
import {
  calculateAvailableBorrowsMarketReferenceCurrency,
  calculateHealthFactorFromBalances,
  getCompoundedBalance,
  getLinearBalance,
  getMarketReferenceCurrencyAndUsdBalance,
} from "@/core/pool-math"
import type {
  Account,
  MarketPositions,
  MarketReserves,
  Position,
  PositionSummary,
  Reserve,
  ReserveSummary,
} from "@/types"

/**
 * Turns a user's decoded positions into what they are actually worth and how
 * close to liquidation they are.
 *
 * The request carries both halves of the reserve on purpose. Accruing a scaled
 * balance needs the pool's indices, rates and last-update timestamp, which are
 * chain state and live on `Reserve`; the summaries decide which reserves count
 * and carry the derived flags an account has to agree with (a reserve is
 * isolated here exactly when its summary says it is). A position whose reserve
 * has no summary is skipped, the same way upstream drops a user reserve it
 * cannot join.
 *
 * Nothing here reads a clock — balances accrue to the timestamp the caller
 * passes (ADR-0004) — and every number out is a plain fixed-point decimal
 * string in human units, produced with `toFixed` (ADR-0006).
 */
export type SummarizeAccountRequest = {
  /** Chain state for the market: the reserves and its base currency. */
  reserves: MarketReserves
  /** The US-010 summaries for those reserves, joined by underlying asset. */
  summaries: ReserveSummary[]
  /** The user's per-reserve state and the e-mode category they are in. */
  positions: MarketPositions
  /** Unix seconds to accrue balances to. */
  currentTimestamp: number
}

export type AccountSummary = {
  account: Account
  positions: PositionSummary[]
}

export function summarizeAccount({
  reserves,
  summaries,
  positions,
  currentTimestamp,
}: SummarizeAccountRequest): AccountSummary {
  const { marketReferenceCurrencyDecimals } = reserves.baseCurrency
  const marketReferencePriceInUsd = shift(
    Decimal(reserves.baseCurrency.marketReferenceCurrencyPriceInUsd),
    -USD_DECIMALS,
  )

  /** A market-reference-currency amount, in base units, into human USD. */
  const toUsd = (baseUnits: Big): Big =>
    shift(
      baseUnits.times(marketReferencePriceInUsd),
      -marketReferenceCurrencyDecimals,
    )

  const valued = positions.positions.flatMap((position) => {
    const reserve = reserves.reserves.find(
      (candidate) => candidate.underlyingAsset === position.underlyingAsset,
    )
    const summary = summaries.find(
      (candidate) => candidate.underlyingAsset === position.underlyingAsset,
    )

    return reserve && summary
      ? [
          valuePosition({
            position,
            reserve,
            summary,
            marketReferenceCurrencyDecimals,
            marketReferencePriceInUsd,
            currentTimestamp,
          }),
        ]
      : []
  })

  const totals = accumulate(valued, positions.eModeCategoryId)

  const headroom = totals.isolatedReserve
    ? isolationHeadroom(totals.isolatedReserve, marketReferenceCurrencyDecimals)
    : null
  const uncappedAvailableBorrows =
    calculateAvailableBorrowsMarketReferenceCurrency({
      collateralBalanceMarketReferenceCurrency: totals.collateral,
      borrowBalanceMarketReferenceCurrency: totals.borrows,
      currentLtv: totals.ltv,
    })
  const availableBorrows =
    headroom && headroom.lt(uncappedAvailableBorrows)
      ? headroom
      : uncappedAvailableBorrows

  const totalLiquidityUsd = toUsd(totals.liquidity)
  const totalBorrowsUsd = toUsd(totals.borrows)

  const account: Account = {
    address: positions.user,

    healthFactor: calculateHealthFactorFromBalances({
      collateralBalanceMarketReferenceCurrency: totals.collateral,
      borrowBalanceMarketReferenceCurrency: totals.borrows,
      currentLiquidationThreshold: totals.liquidationThreshold,
    }).toFixed(),

    totalLiquidityMarketReferenceCurrency: normalize(
      totals.liquidity,
      marketReferenceCurrencyDecimals,
    ),
    totalLiquidityUsd: totalLiquidityUsd.toFixed(),
    totalCollateralMarketReferenceCurrency: normalize(
      totals.collateral,
      marketReferenceCurrencyDecimals,
    ),
    totalCollateralUsd: toUsd(totals.collateral).toFixed(),
    totalBorrowsMarketReferenceCurrency: normalize(
      totals.borrows,
      marketReferenceCurrencyDecimals,
    ),
    totalBorrowsUsd: totalBorrowsUsd.toFixed(),
    netWorthUsd: totalLiquidityUsd.minus(totalBorrowsUsd).toFixed(),

    availableBorrowsMarketReferenceCurrency: normalize(
      availableBorrows,
      marketReferenceCurrencyDecimals,
    ),
    availableBorrowsUsd: toUsd(availableBorrows).toFixed(),
    currentLoanToValue: normalize(totals.ltv, LTV_PRECISION),
    currentLiquidationThreshold: normalize(
      totals.liquidationThreshold,
      LTV_PRECISION,
    ),

    eModeCategoryId: positions.eModeCategoryId,

    isInIsolationMode: totals.isolatedReserve !== null,
    isolatedReserve: totals.isolatedReserve?.underlyingAsset ?? null,
  }

  return { account, positions: valued.map((entry) => entry.summary) }
}

/* -------------------------------------------------------------------------- */

type ValuedPosition = {
  summary: PositionSummary
  reserve: Reserve
  isIsolated: boolean
  usageAsCollateralEnabledOnUser: boolean
  /** Base units of the market reference currency, so totals stay exact. */
  underlyingBalanceMarketReferenceCurrency: Big
  variableBorrowsMarketReferenceCurrency: Big
}

type ValuePositionRequest = {
  position: Position
  reserve: Reserve
  summary: ReserveSummary
  marketReferenceCurrencyDecimals: number
  marketReferencePriceInUsd: Big
  currentTimestamp: number
}

function valuePosition({
  position,
  reserve,
  summary,
  marketReferenceCurrencyDecimals,
  marketReferencePriceInUsd,
  currentTimestamp,
}: ValuePositionRequest): ValuedPosition {
  const { decimals, priceInMarketReferenceCurrency } = reserve

  const underlyingBalance = getLinearBalance({
    balance: BigInt(position.scaledATokenBalance),
    index: BigInt(reserve.liquidityIndex),
    rate: BigInt(reserve.liquidityRate),
    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    currentTimestamp,
  })
  const underlying = getMarketReferenceCurrencyAndUsdBalance({
    balance: underlyingBalance.toString(),
    priceInMarketReferenceCurrency,
    marketReferenceCurrencyDecimals,
    decimals,
    marketReferencePriceInUsdNormalized: marketReferencePriceInUsd,
  })

  const variableBorrows = getCompoundedBalance({
    principalBalance: BigInt(position.scaledVariableDebt),
    reserveIndex: BigInt(reserve.variableBorrowIndex),
    reserveRate: BigInt(reserve.variableBorrowRate),
    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    currentTimestamp,
  })
  const borrows = getMarketReferenceCurrencyAndUsdBalance({
    balance: variableBorrows.toString(),
    priceInMarketReferenceCurrency,
    marketReferenceCurrencyDecimals,
    decimals,
    marketReferencePriceInUsdNormalized: marketReferencePriceInUsd,
  })

  return {
    reserve,
    isIsolated: summary.isIsolated,
    usageAsCollateralEnabledOnUser: position.usageAsCollateralEnabledOnUser,
    underlyingBalanceMarketReferenceCurrency:
      underlying.marketReferenceCurrencyBalance,
    variableBorrowsMarketReferenceCurrency:
      borrows.marketReferenceCurrencyBalance,
    summary: {
      underlyingAsset: position.underlyingAsset,
      symbol: summary.symbol,
      usageAsCollateralEnabledOnUser: position.usageAsCollateralEnabledOnUser,

      underlyingBalance: normalize(underlyingBalance.toString(), decimals),
      underlyingBalanceMarketReferenceCurrency: normalize(
        underlying.marketReferenceCurrencyBalance,
        marketReferenceCurrencyDecimals,
      ),
      underlyingBalanceUsd: underlying.usdBalance.toFixed(),

      variableBorrows: normalize(variableBorrows.toString(), decimals),
      variableBorrowsMarketReferenceCurrency: normalize(
        borrows.marketReferenceCurrencyBalance,
        marketReferenceCurrencyDecimals,
      ),
      variableBorrowsUsd: borrows.usdBalance.toFixed(),

      // Filled in by the incentives pass.
      rewards: [],
    },
  }
}

type AccountTotals = {
  /** All in base units of the market reference currency. */
  liquidity: Big
  collateral: Big
  borrows: Big
  /** Basis points, truncated the way the pool's integer division does. */
  ltv: Big
  liquidationThreshold: Big
  /** The isolated reserve backing the account, if it is in isolation mode. */
  isolatedReserve: Reserve | null
}

function accumulate(
  valued: ValuedPosition[],
  userEModeCategoryId: number,
): AccountTotals {
  let liquidity = Integer(0)
  let collateral = Integer(0)
  let borrows = Integer(0)
  let weightedLtv = Decimal(0)
  let weightedLiquidationThreshold = Decimal(0)
  let isolatedReserve: Reserve | null = null

  for (const entry of valued) {
    const { reserve } = entry
    const balance = entry.underlyingBalanceMarketReferenceCurrency

    liquidity = liquidity.plus(balance)
    borrows = borrows.plus(entry.variableBorrowsMarketReferenceCurrency)

    // A reserve with a zero liquidation threshold backs nothing, however the
    // user has it flagged.
    if (
      reserve.reserveLiquidationThreshold === "0" ||
      !entry.usageAsCollateralEnabledOnUser
    ) {
      continue
    }

    if (entry.isIsolated) isolatedReserve = reserve

    collateral = collateral.plus(balance)

    // E-mode parameters apply only to collateral in the user's own category;
    // everything else is valued at the reserve's base parameters.
    const inEMode =
      userEModeCategoryId !== 0 &&
      userEModeCategoryId === reserve.eModeCategoryId
    weightedLtv = weightedLtv.plus(
      balance.times(inEMode ? reserve.eModeLtv : reserve.baseLTVasCollateral),
    )
    weightedLiquidationThreshold = weightedLiquidationThreshold.plus(
      balance.times(
        inEMode
          ? reserve.eModeLiquidationThreshold
          : reserve.reserveLiquidationThreshold,
      ),
    )
  }

  return {
    liquidity,
    collateral,
    borrows,
    // Truncated, not rounded: the pool averages these with integer division.
    // Upstream wraps the quotient in its zero-decimal BigNumber, which does
    // nothing — BigNumber.js applies DECIMAL_PLACES to `div`, not to its
    // constructor — so it keeps twenty places the contracts never hold
    // (ADR-0008: the divergence is deliberate and not a retuned expectation).
    ltv: weightedLtv.gt(0) ? Integer(weightedLtv).div(collateral) : Integer(0),
    liquidationThreshold: weightedLiquidationThreshold.gt(0)
      ? Integer(weightedLiquidationThreshold).div(collateral)
      : Integer(0),
    isolatedReserve,
  }
}

/**
 * What is left under an isolated reserve's debt ceiling, in base units of the
 * market reference currency. The ceiling is denominated in USD at
 * `debtCeilingDecimals`, so it shifts by the difference between the two.
 */
function isolationHeadroom(
  reserve: Reserve,
  marketReferenceCurrencyDecimals: number,
): Big {
  const remaining = shift(
    Decimal(reserve.debtCeiling).minus(reserve.isolationModeTotalDebt),
    -(reserve.debtCeilingDecimals - marketReferenceCurrencyDecimals),
  )

  return remaining.gt(0) ? remaining : Decimal(0)
}
