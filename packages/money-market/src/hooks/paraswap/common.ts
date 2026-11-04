import { valueToWei } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { BigNumber } from "bignumber.js"

import { ComputedReserveData } from "@/hooks/commonTypes"

// The subset of ParaSwap's `OptimalRate` the swap hooks read, so the package
// doesn't depend on `@paraswap/sdk`.
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

// Rate fetching and tx building, injected through `MoneyMarketProvider` so the
// swap hooks don't depend on ParaSwap. Signatures follow aave-interface.
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
   * Builds and submits the collateral swap. It is a papi extrinsic, which can't
   * go through the EVM-typed `MoneyMarketTxFn`.
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

// Used until a provider is injected; throws so an unwired flow fails loudly.
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
  // ParaSwap returns this one as a sentence rather than an error code.
  "No routes found with enough liquidity":
    "No routes found with enough liquidity.",
}

const MESSAGE_REGEX_MAP: Array<{ regex: RegExp; message: string }> = [
  {
    regex: /^Amount \d+ is too small to proceed$/,
    message: "Amount is too small. Please try larger amount.",
  },
]

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

// Margin above the balance so the signature still covers interest accrued before execution.
export const SIGNATURE_AMOUNT_MARGIN = 0.1

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
