import type { Address } from "viem"
import { z } from "zod"

import type {
  BaseCurrency,
  IncentiveEmission,
  IncentiveSide,
  Reserve,
  ReserveIncentives,
} from "@/types"

/**
 * The decode boundary. This is the only module in the package where zod runs;
 * everything above it trusts its input.
 *
 * The schemas parse what viem hands back from a contract call and hand on the
 * domain types, which means two conversions happen here and nowhere else:
 * `bigint` becomes a raw base-unit decimal string, and an address is lowercased
 * so it can be used as a key. viem widens an integer to `bigint` only above 48
 * bits, so every numeric leaf accepts both representations rather than
 * hard-coding which side of that boundary a given field falls on.
 *
 * Schemas are internal — `src/core/index.ts` must not re-export them, and no
 * `ZodError` may escape the read that calls `decode`.
 */

/** Any solidity integer, as the one representation the rest of the module uses. */
const integer = z.union([z.bigint(), z.number().int()]).transform(BigInt)

/** A count or an identifier the contracts report as a small integer. */
const count = integer.transform(Number)

/** A quantity, kept exact as a raw base-unit decimal string. */
const numeric = integer.transform((value) => value.toString())

/** An EVM address, lowercased so it is comparable. */
const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "Not an EVM address")
  .transform((value) => value.toLowerCase() as Address)

const reserve: z.ZodType<Reserve> = z.object({
  underlyingAsset: address,
  name: z.string(),
  symbol: z.string(),
  decimals: count,
  aTokenAddress: address,
  variableDebtTokenAddress: address,
  interestRateStrategyAddress: address,

  baseLTVasCollateral: numeric,
  reserveLiquidationThreshold: numeric,
  reserveLiquidationBonus: numeric,
  reserveFactor: numeric,

  usageAsCollateralEnabled: z.boolean(),
  borrowingEnabled: z.boolean(),
  flashLoanEnabled: z.boolean(),
  isActive: z.boolean(),
  isFrozen: z.boolean(),
  isPaused: z.boolean(),

  liquidityIndex: numeric,
  variableBorrowIndex: numeric,
  liquidityRate: numeric,
  variableBorrowRate: numeric,
  lastUpdateTimestamp: count,

  availableLiquidity: numeric,
  totalScaledVariableDebt: numeric,
  unbacked: numeric,
  priceInMarketReferenceCurrency: numeric,

  supplyCap: numeric,
  borrowCap: numeric,
  debtCeiling: numeric,
  debtCeilingDecimals: count,
  isolationModeTotalDebt: numeric,
  borrowableInIsolation: z.boolean(),
  isSiloedBorrowing: z.boolean(),

  eModeCategoryId: count,
  eModeLabel: z.string(),
  eModeLtv: count,
  eModeLiquidationThreshold: count,
  eModeLiquidationBonus: count,
})

/**
 * The market's reference currency is reported as a unit (`1e8`), not as a
 * number of decimals. Upstream derives the decimals from the digit count and so
 * does this — the unit is always a power of ten.
 */
const baseCurrency: z.ZodType<BaseCurrency> = z
  .object({
    marketReferenceCurrencyUnit: integer,
    marketReferenceCurrencyPriceInUsd: numeric,
    networkBaseTokenPriceInUsd: numeric,
    networkBaseTokenPriceDecimals: count,
  })
  .transform(({ marketReferenceCurrencyUnit, ...rest }) => ({
    marketReferenceCurrencyDecimals:
      marketReferenceCurrencyUnit.toString().length - 1,
    ...rest,
  }))

const emission: z.ZodType<IncentiveEmission> = z.object({
  rewardTokenSymbol: z.string(),
  rewardTokenAddress: address,
  rewardOracleAddress: address,
  emissionPerSecond: numeric,
  incentivesLastUpdateTimestamp: count,
  tokenIncentivesIndex: numeric,
  emissionEndTimestamp: count,
  rewardPriceFeed: numeric,
  rewardTokenDecimals: count,
  precision: count,
  priceFeedDecimals: count,
})

const incentiveSide: z.ZodType<IncentiveSide> = z
  .object({
    tokenAddress: address,
    incentiveControllerAddress: address,
    rewardsTokenInformation: z.array(emission),
  })
  .transform(({ rewardsTokenInformation, ...rest }) => ({
    ...rest,
    emissions: rewardsTokenInformation,
  }))

/** The stable side (`sIncentiveData`) is deliberately not carried across. */
const reserveIncentives: z.ZodType<ReserveIncentives> = z
  .object({
    underlyingAsset: address,
    aIncentiveData: incentiveSide,
    vIncentiveData: incentiveSide,
  })
  .transform(({ underlyingAsset, aIncentiveData, vIncentiveData }) => ({
    underlyingAsset,
    supply: aIncentiveData,
    variableBorrow: vIncentiveData,
  }))

/** `getReservesData` returns the reserve array and the base currency together. */
export const reservesDataSchema = z.tuple([z.array(reserve), baseCurrency])

/** `getReservesIncentivesData`. An empty array is a valid, ordinary result. */
export const reservesIncentivesDataSchema = z.array(reserveIncentives)
