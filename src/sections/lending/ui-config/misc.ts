import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

export const MONEY_MARKET_SUPPLY_BLACKLIST = [
  getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID),
]
