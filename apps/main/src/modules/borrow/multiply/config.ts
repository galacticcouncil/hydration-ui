import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { CryptoBear, CryptoBull } from "@galacticcouncil/ui/assets/icons"
import {
  DOT_ASSET_ID,
  GDOT_ASSET_ID,
  HOLLAR_ASSET_ID,
  PRIME_ASSET_ID,
  USDT_ASSET_ID,
  WBTC_ASSET_ID,
} from "@galacticcouncil/utils"

import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"

export const FEATURED_RESERVES_COUNT = 4
export const MAX_SAFE_LEVERAGE_FACTOR = 0.95

export type MultiplyAssetPair = {
  name?: string
  icon?: React.ComponentType
  collateralAssetId: string
  debtAssetId: string
  enterWithAssetId?: string
  isParityPair: boolean
  eModeCategory: EModeCategory
}

export const MULTIPLY_ASSETS_PAIRS: MultiplyAssetPair[] = [
  {
    collateralAssetId: PRIME_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: true,
  },
  {
    collateralAssetId: GDOT_ASSET_ID,
    debtAssetId: DOT_ASSET_ID,
    enterWithAssetId: DOT_ASSET_ID,
    eModeCategory: EModeCategory.DOT_CORRELATED,
    isParityPair: true,
  },
  {
    collateralAssetId: WBTC_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    name: "Crypto Bull",
    icon: CryptoBull,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  },
  {
    collateralAssetId: USDT_ASSET_ID,
    debtAssetId: WBTC_ASSET_ID,
    name: "Crypto Bear",
    icon: CryptoBear,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  },
]

export const MULTIPLY_ASSETS_CONFIG: MultiplyAssetPairConfig[] =
  MULTIPLY_ASSETS_PAIRS.map((pair) => ({
    id: `${pair.collateralAssetId}-${pair.debtAssetId}`,
    ...pair,
  }))
