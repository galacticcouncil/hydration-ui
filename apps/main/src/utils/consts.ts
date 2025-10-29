import Big from "big.js"
import { millisecondsInDay, millisecondsInHour } from "date-fns/constants"

export const NATIVE_ASSET_ID = "0"
export const NATIVE_ASSET_DECIMALS = 12
export const NATIVE_EVM_ASSET_ID = "20"
export const HUB_ID = "1"

export const PARACHAIN_BLOCK_TIME = 6_000
export const RELAY_BLOCK_TIME = 6_000

export const GC_TIME = millisecondsInDay
export const STALE_TIME = millisecondsInHour

export const POT_ADDRESS = "7L53bUTCCAvmCxhe15maHwJZbjQYH89LkXuyTnTi1J58xyFC"

export const QUINTILL = new Big(10).pow(18)
