import {
  GIGA_ASSETS,
  HOLLAR_ASSETS,
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
} from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

export const HEALTH_FACTOR_RISK_THRESHOLD = 1.5

export const MONEY_MARKET_GIGA_RESERVES = [
  USDT_POOL_ASSET_ID,
  ...HOLLAR_ASSETS,
  ...GIGA_ASSETS,
].map(getAddressFromAssetId)

export const EXTERNAL_APY_ENABLED_ASSET_IDS = [
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
  ...HOLLAR_ASSETS,
  ...GIGA_ASSETS,
]
