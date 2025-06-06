import { ChainId } from "@aave/contract-helpers"
import { USD_DECIMALS } from "@aave/math-utils"
import { Provider } from "@ethersproject/providers"
import { bigShift } from "@galacticcouncil/utils"
import { Big, BigSource } from "big.js"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export interface ProviderWithSend extends Provider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send<P = any, R = any>(method: string, params: Array<P>): Promise<R>
}

export function hexToAscii(_hex: string): string {
  const hex = _hex.toString()
  let str = ""
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
  }
  return str
}

export interface CancelablePromise<T = unknown> {
  promise: Promise<T>
  cancel: () => void
}

export const makeCancelable = <T>(promise: Promise<T>) => {
  let hasCanceled_ = false

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      (error) => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error)),
    )
  })

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true
    },
  }
}

export const optimizedPath = (currentChainId: ChainId) => {
  return (
    currentChainId === ChainId.arbitrum_one ||
    currentChainId === ChainId.arbitrum_rinkeby ||
    currentChainId === ChainId.optimism
    // ||
    // currentChainId === ChainId.optimism_kovan
  )
}

// Overrides for minimum base token remaining after performing an action
export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
}

export const amountToUsd = (
  amount: BigSource,
  formattedPriceInMarketReferenceCurrency: string,
  marketReferencePriceInUsd: string,
) => {
  return bigShift(
    Big(amount)
      .mul(formattedPriceInMarketReferenceCurrency)
      .mul(marketReferencePriceInUsd),
    -USD_DECIMALS,
  )
}

type NativeToUSD = {
  amount: BigSource
  currencyDecimals: number
  priceInMarketReferenceCurrency: BigSource
  marketReferenceCurrencyDecimals: number
  normalizedMarketReferencePriceInUsd: BigSource
}

export function nativeToUSD({
  amount,
  currencyDecimals,
  priceInMarketReferenceCurrency,
  marketReferenceCurrencyDecimals,
  normalizedMarketReferencePriceInUsd,
}: NativeToUSD) {
  return Big(amount)
    .mul(priceInMarketReferenceCurrency)
    .mul(normalizedMarketReferencePriceInUsd)
    .div(bigShift(1, currencyDecimals + marketReferenceCurrencyDecimals))
    .toString()
}

export const roundToTokenDecimals = (
  inputValue: string,
  tokenDecimals: number,
) => {
  const [whole, decimals] = inputValue.split(".")

  // If there are no decimal places or the number of decimal places is within the limit
  if (!decimals || decimals.length <= tokenDecimals) {
    return inputValue
  }

  // Truncate the decimals to the specified number of token decimals
  const adjustedDecimals = decimals.slice(0, tokenDecimals)

  // Combine the whole and adjusted decimal parts
  return whole + "." + adjustedDecimals
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFunctionDefsFromAbi = (abi: any[], method: string) => {
  try {
    const defs = abi.filter(
      (item) => item.type === "function" && item.name === method,
    )
    return JSON.stringify(defs)
  } catch (err) {
    console.error("Error parsing ABI:", err)
  }
}

export const wssToHttps = (url: string) => {
  if (url.includes("ws://")) return url.replace("ws://", "http://")

  return url.replace("wss://", "https://")
}
