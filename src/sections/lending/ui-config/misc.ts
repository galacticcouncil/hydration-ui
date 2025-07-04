import { UseQueryOptions } from "@tanstack/react-query"
import { vdotApyQuery } from "api/external/bifrost"
import { lidoEthAPRQuery } from "api/external/ethereum"
import {
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  VDOT_ASSET_ID,
} from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

export const HEALTH_FACTOR_RISK_THRESHOLD = 1.5

export const EXTERNAL_APY_QUERIES: Record<string, UseQueryOptions<number>> = {
  [VDOT_ASSET_ID]: vdotApyQuery,
  [GETH_STABLESWAP_ASSET_ID]: lidoEthAPRQuery,
}

export const MONEY_MARKET_SUPPLY_BLACKLIST = [
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
].map(getAddressFromAssetId)
