import { TAsset } from "providers/assets"
import {
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  HUSDC_ASSET_ID,
  HUSDE_ASSET_ID,
  HUSDS_ASSET_ID,
  HUSDT_ASSET_ID,
} from "utils/constants"

export const ASSET_METADATA_OVERRIDES: Record<string, Partial<TAsset>> = {
  [GDOT_STABLESWAP_ASSET_ID]: {
    name: "GIGADOT",
    symbol: "GDOT",
  },
  [GETH_STABLESWAP_ASSET_ID]: {
    name: "GIGAETH",
    symbol: "GETH",
  },
  [HUSDC_ASSET_ID]: {
    name: "2-Pool-HUSDC",
    symbol: "HUSDC",
  },
  [HUSDT_ASSET_ID]: {
    name: "2-Pool-HUSDT",
    symbol: "HUSDT",
  },
  [HUSDS_ASSET_ID]: {
    name: "2-Pool-HUSDs",
    symbol: "HUSDs",
  },
  [HUSDE_ASSET_ID]: {
    name: "2-Pool-HUSDe",
    symbol: "HUSDe",
  },
}
