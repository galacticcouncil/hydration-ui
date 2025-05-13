import Big from "big.js"

import { TAsset } from "@/providers/assetsProvider"
import { scale } from "@/utils/formatting"

export const HYDRATION_PARACHAIN_ID = 2034

export const MIN_NATIVE_AMOUNT = "1000000000000000"
export const NATIVE_ASSET_ID = "0"
export const NATIVE_ASSET_DECIMALS = 12
export const HUB_ID = "1"

export const USDT_ASSET_ID = "10"

export const PARACHAIN_BLOCK_TIME = 12_000

export const QUERY_KEY_BLOCK_PREFIX = "@block"

export const SECOND_MS = 1000
export const MINUTE_MS = SECOND_MS * 60
export const HOUR_MS = MINUTE_MS * 60
export const DAY_MS = HOUR_MS * 24
export const WEEK_MS = DAY_MS * 7
export const MONTH_MS = DAY_MS * 30

export function exchangeNative(
  exchangeRate: bigint,
  asset: TAsset | null,
  amountNative: bigint,
): bigint {
  if (!exchangeRate || !asset) {
    return 0n
  }

  if (NATIVE_ASSET_ID === asset.id) {
    return BigInt(Big(amountNative.toString()).toFixed(0, 0))
  }

  const result = Big(amountNative.toString()).div(exchangeRate.toString())
  return BigInt(scale(result.toString(), asset.decimals))
}
