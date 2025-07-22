import { UseQueryOptions } from "@tanstack/react-query"
import { vdotApyQuery } from "api/external/bifrost"
import {
  lidoEthAPRQuery,
  ethenaUsdAPRQuery,
  skyUsdAPRQuery,
} from "api/external/ethereum"
import {
  GETH_STABLESWAP_ASSET_ID,
  HOLLAR_POOLS,
  HUSDE_ASSET_ID,
  HUSDS_ASSET_ID,
  STRATEGY_ASSETS_BLACKLIST,
  VDOT_ASSET_ID,
} from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

export const HEALTH_FACTOR_RISK_THRESHOLD = 1.5

export const EXTERNAL_APY_QUERIES: Record<string, UseQueryOptions<number>> = {
  [VDOT_ASSET_ID]: vdotApyQuery,
  [GETH_STABLESWAP_ASSET_ID]: lidoEthAPRQuery,
  [HUSDE_ASSET_ID]: ethenaUsdAPRQuery,
  [HUSDS_ASSET_ID]: skyUsdAPRQuery,
}

export const MONEY_MARKET_GIGA_RESERVES = [
  ...STRATEGY_ASSETS_BLACKLIST,
  ...HOLLAR_POOLS,
].map(getAddressFromAssetId)
