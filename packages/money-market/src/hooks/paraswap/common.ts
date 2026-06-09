import { valueToWei } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { BigNumber } from "bignumber.js"

import { ComputedReserveData } from "@/hooks/commonTypes"

/**
 * Minimal local equivalent of ParaSwap's `OptimalRate` type. The full
 * `@paraswap/sdk` type is intentionally NOT imported here (see PRD): the swap
 * hooks only read the fields below from a returned route, and a Hydration-native
 * SwapRateProvider implementation is free to return a richer object cast to this
 * type.
 */
export type OptimalRate = {
  srcToken: string
  srcDecimals: number
  srcAmount: string
  srcUSD: string
  destToken: string
  destDecimals: number
  destAmount: string
  destUSD: string
  priceImpactPct: number
}

export type UseSwapProps = {
  chainId: number
  max: boolean
  maxSlippage: number
  swapIn: SwapReserveData
  swapOut: SwapReserveData
  userAddress: string
  skip: boolean
}

export type SwapReserveData = ComputedReserveData & { amount: string }

export type SwapData = Pick<
  SwapReserveData,
  "amount" | "underlyingAsset" | "decimals" | "supplyAPY" | "variableBorrowAPY"
>

export type SwapVariant = "exactIn" | "exactOut"

type SwapRateParams = {
  inputAmount: string
  outputAmount: string
  inputAmountUSD: string
  outputAmountUSD: string
}

export type SwapTransactionParams = SwapRateParams & {
  swapCallData: string
  augustus: string
}

/**
 * Injectable rate/tx-building provider. This isolates the ParaSwap-specific
 * logic (rate fetching + transaction param building) behind an interface so a
 * Hydration-native implementation can be supplied via `MoneyMarketProvider`
 * without pulling in `@paraswap/sdk`. The signatures mirror the original
 * aave-interface `hooks/paraswap/common.ts` helpers consumed by the swap hooks.
 */
export interface SwapRateProvider {
  /**
   * Fetch the route for a 'Sell' / 'Exact In' swap. The swap-in amount is fixed
   * and slippage is applied to the amount received.
   */
  fetchExactInRate(
    swapIn: SwapData,
    swapOut: SwapData,
    chainId: number,
    userAddress: string,
    max?: boolean,
  ): Promise<OptimalRate>
  /** Build the transaction parameters for a 'Sell' / 'Exact In' swap. */
  fetchExactInTxParams(
    route: OptimalRate,
    swapIn: SwapData,
    swapOut: SwapData,
    chainId: number,
    userAddress: string,
    maxSlippage: number,
  ): Promise<SwapTransactionParams>
  /**
   * Build AND submit the native collateral-swap transaction for a 'Sell' /
   * 'Exact In' swap, owning both steps in app-land.
   *
   * Unlike {@link fetchExactInTxParams} (ParaSwap path: returns calldata for an
   * EVM call routed through `onCreateTransaction`), the Hydration-native
   * collateral swap is a papi extrinsic that cannot pass through the EVM-typed
   * `MoneyMarketTxFn`. So the implementation closes over the app's
   * `createTransaction` and submits directly, returning once the standard
   * sign/submit modal has been opened.
   */
  submitCollateralSwap(
    route: OptimalRate,
    swapIn: SwapData,
    swapOut: SwapData,
    chainId: number,
    userAddress: string,
    maxSlippage: number,
  ): Promise<void>
  /**
   * Fetch the route for a 'Buy' / 'Exact Out' swap. The amount received is fixed
   * and positive slippage is applied to the input amount.
   */
  fetchExactOutRate(
    swapIn: SwapData,
    swapOut: SwapData,
    chainId: number,
    userAddress: string,
    max: boolean,
  ): Promise<OptimalRate>
  /** Build the transaction parameters for a 'Buy' / 'Exact Out' swap. */
  fetchExactOutTxParams(
    route: OptimalRate,
    swapIn: SwapData,
    swapOut: SwapData,
    chainId: number,
    userAddress: string,
    maxSlippage: number,
  ): Promise<SwapTransactionParams>
}

/**
 * Default stub used until a real `SwapRateProvider` implementation is injected
 * through `MoneyMarketProvider`. Every method throws so that an unwired Swap /
 * Debt Switch flow fails loudly instead of silently returning bad data.
 */
const throwNotImplemented = (): never => {
  throw new Error(
    "SwapRateProvider not implemented. Inject a `swapRateProvider` implementation via <MoneyMarketProvider />.",
  )
}

export const notImplementedSwapRateProvider: SwapRateProvider = {
  fetchExactInRate: throwNotImplemented,
  fetchExactInTxParams: throwNotImplemented,
  submitCollateralSwap: throwNotImplemented,
  fetchExactOutRate: throwNotImplemented,
  fetchExactOutTxParams: throwNotImplemented,
}

const MESSAGE_MAP: { [key: string]: string } = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT:
    "Price impact too high. Please try a different amount or asset pair.",
  // not sure why this error-code is not upper-cased
  "No routes found with enough liquidity":
    "No routes found with enough liquidity.",
}

const MESSAGE_REGEX_MAP: Array<{ regex: RegExp; message: string }> = [
  {
    regex: /^Amount \d+ is too small to proceed$/,
    message: "Amount is too small. Please try larger amount.",
  },
]

/**
 * Converts Paraswap error message to message for displaying in interface
 * @param message Paraswap error message
 * @returns Message for displaying in interface
 */
export function convertParaswapErrorMessage(
  message: string,
): string | undefined {
  if (message in MESSAGE_MAP) {
    return MESSAGE_MAP[message]
  }

  const newMessage = MESSAGE_REGEX_MAP.find((mapping) =>
    mapping.regex.test(message),
  )?.message
  return newMessage
}

// generate signature approval a certain threshold above the current balance to account for accrued interest
export const SIGNATURE_AMOUNT_MARGIN = 0.1

// Calculate aToken amount to request for signature, adding small margin to account for accruing interest
export const calculateSignedAmount = (
  amount: string,
  decimals: number,
  margin?: number,
) => {
  const amountBN = valueToBigNumber(amount)
  const marginBN = valueToBigNumber(margin ?? SIGNATURE_AMOUNT_MARGIN)
  const amountWithMargin = amountBN.plus(amountBN.multipliedBy(marginBN))
  const formattedAmountWithMargin = valueToWei(
    amountWithMargin.toString(),
    decimals,
  )
  return formattedAmountWithMargin
}

export const maxInputAmountWithSlippage = (
  inputAmount: string,
  slippage: string,
  decimals: number,
) => {
  if (inputAmount === "0") return "0"
  return valueToBigNumber(inputAmount)
    .multipliedBy(1 + Number(slippage) / 100)
    .toFixed(decimals, BigNumber.ROUND_UP)
}

export const minimumReceivedAfterSlippage = (
  outputAmount: string,
  slippage: string,
  decimals: number,
) => {
  if (outputAmount === "0") return "0"
  return valueToBigNumber(outputAmount)
    .multipliedBy(1 - Number(slippage) / 100)
    .toFixed(decimals)
}
