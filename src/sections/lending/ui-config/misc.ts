import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

export const HEALTH_FACTOR_RISK_THRESHOLD = 1.5

export const MONEY_MARKET_SUPPLY_BLACKLIST = [
  getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID),
]
