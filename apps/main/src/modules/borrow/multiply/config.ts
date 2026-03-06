import { CryptoBear, CryptoBull } from "@galacticcouncil/ui/assets/icons"
import {
  DOT_ASSET_ID,
  GDOT_ASSET_ID,
  HOLLAR_ASSET_ID,
  PRIME_ASSET_ID,
  USDT_ASSET_ID,
  WBTC_ASSET_ID,
} from "@galacticcouncil/utils"

export const MAX_SAFE_LEVERAGE_FACTOR = 0.95

export type MultiplyAssetConfig = {
  name?: string
  collateralAssetId: string
  debtAssetId: string
  enterWithAssetId?: string
  icon?: React.ComponentType
}

export const MULTIPLY_ASSETS_CONFIG: MultiplyAssetConfig[] = [
  {
    collateralAssetId: PRIME_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
  },
  {
    collateralAssetId: GDOT_ASSET_ID,
    debtAssetId: DOT_ASSET_ID,
    enterWithAssetId: DOT_ASSET_ID,
  },
  {
    collateralAssetId: WBTC_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    name: "Crypto Bull",
    icon: CryptoBull,
  },
  {
    collateralAssetId: USDT_ASSET_ID,
    debtAssetId: WBTC_ASSET_ID,
    name: "Crypto Bear",
    icon: CryptoBear,
  },
]
