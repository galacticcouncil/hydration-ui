import { millisecondsInDay, millisecondsInHour } from "date-fns/constants"

export const HYDRATION_PARACHAIN_ID = 2034
export const HYDRATION_CHAIN_KEY = "hydration"

export const NATIVE_ASSET_ID = "0"
export const NATIVE_ASSET_DECIMALS = 12
export const NATIVE_EVM_ASSET_ID = "20"
export const HUB_ID = "1"

export const H2O_ASSET_ID = "1"
export const USDT_ASSET_ID = "10"
export const GDOT_ASSET_ID = "690"
export const GDOT_ERC20_ID = "69"
export const GETH_ASSET_ID = "4200"
export const GETH_ERC20_ID = "420"
export const DOT_ASSET_ID = "5"

export const PARACHAIN_BLOCK_TIME = 12_000

export const SELL_ONLY_ASSETS = [H2O_ASSET_ID, GDOT_ASSET_ID]

export const GC_TIME = millisecondsInDay
export const STALE_TIME = millisecondsInHour
