import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { CryptoBear, CryptoBull } from "@galacticcouncil/ui/assets/icons"
import {
  DOT_ASSET_ID,
  GDOT_ASSET_ID,
  HOLLAR_ASSET_ID,
  PRIME_ASSET_ID,
  TBTC_ASSET_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
  WBTC_ASSET_ID,
} from "@galacticcouncil/utils"

import {
  MultiplyAssetPairConfig,
  MultiplyStrategyConfig,
} from "@/modules/borrow/multiply/types"

export const createPairId = (collateralAssetId: string, debtAssetId: string) =>
  `${collateralAssetId}-${debtAssetId}`

export const PAIR_IDS = {
  PRIME_HOLLAR: createPairId(PRIME_ASSET_ID, HOLLAR_ASSET_ID),
  GDOT_DOT: createPairId(GDOT_ASSET_ID, DOT_ASSET_ID),
  TBTC_HOLLAR: createPairId(TBTC_ASSET_ID, HOLLAR_ASSET_ID),
  WBTC_HOLLAR: createPairId(WBTC_ASSET_ID, HOLLAR_ASSET_ID),
  USDT_TBTC: createPairId(USDT_ASSET_ID, TBTC_ASSET_ID),
  USDT_WBTC: createPairId(USDT_ASSET_ID, WBTC_ASSET_ID),
  USDC_TBTC: createPairId(USDC_ASSET_ID, TBTC_ASSET_ID),
  USDC_WBTC: createPairId(USDC_ASSET_ID, WBTC_ASSET_ID),
} as const

export type MultiplyPairId = (typeof PAIR_IDS)[keyof typeof PAIR_IDS]

export const STRATEGY_IDS = {
  CRYPTO_BULL: "crypto-bull",
  CRYPTO_BEAR: "crypto-bear",
} as const

export type MultiplyStrategyId =
  (typeof STRATEGY_IDS)[keyof typeof STRATEGY_IDS]

const createPair = (
  id: string,
  fields: Omit<MultiplyAssetPairConfig, "id">,
): MultiplyAssetPairConfig => ({ id, ...fields })

export const MULTIPLY_ASSETS_CONFIG: MultiplyAssetPairConfig[] = [
  createPair(PAIR_IDS.PRIME_HOLLAR, {
    collateralAssetId: PRIME_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.GDOT_DOT, {
    collateralAssetId: GDOT_ASSET_ID,
    debtAssetId: DOT_ASSET_ID,
    enterWithAssetId: DOT_ASSET_ID,
    eModeCategory: EModeCategory.DOT_CORRELATED,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.TBTC_HOLLAR, {
    collateralAssetId: TBTC_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.WBTC_HOLLAR, {
    collateralAssetId: WBTC_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.USDT_TBTC, {
    collateralAssetId: USDT_ASSET_ID,
    debtAssetId: TBTC_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.USDT_WBTC, {
    collateralAssetId: USDT_ASSET_ID,
    debtAssetId: WBTC_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.USDC_TBTC, {
    collateralAssetId: USDC_ASSET_ID,
    debtAssetId: TBTC_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
  createPair(PAIR_IDS.USDC_WBTC, {
    collateralAssetId: USDC_ASSET_ID,
    debtAssetId: WBTC_ASSET_ID,
    eModeCategory: EModeCategory.NONE,
    isParityPair: false,
  }),
]

export const MULTIPLY_STRATEGIES_BY_ID: Record<
  MultiplyStrategyId,
  MultiplyStrategyConfig
> = {
  [STRATEGY_IDS.CRYPTO_BULL]: {
    id: STRATEGY_IDS.CRYPTO_BULL,
    name: "Crypto Bull",
    icon: CryptoBull,
    pairIds: [PAIR_IDS.TBTC_HOLLAR, PAIR_IDS.WBTC_HOLLAR],
  },
  [STRATEGY_IDS.CRYPTO_BEAR]: {
    id: STRATEGY_IDS.CRYPTO_BEAR,
    name: "Crypto Bear",
    icon: CryptoBear,
    pairIds: [
      PAIR_IDS.USDT_TBTC,
      PAIR_IDS.USDT_WBTC,
      PAIR_IDS.USDC_TBTC,
      PAIR_IDS.USDC_WBTC,
    ],
  },
}

export const MULTIPLY_STRATEGIES: MultiplyStrategyConfig[] = Object.values(
  MULTIPLY_STRATEGIES_BY_ID,
)

export function getMultiplyStrategyForPairId(
  pairId: string,
): MultiplyStrategyConfig | undefined {
  return MULTIPLY_STRATEGIES.find((s) => s.pairIds.includes(pairId))
}

export const FEATURED_MULTIPLY_HIGHLIGHTS = [
  { type: "pair" as const, pairId: PAIR_IDS.PRIME_HOLLAR },
  { type: "pair" as const, pairId: PAIR_IDS.GDOT_DOT },
  { type: "strategy" as const, strategyId: STRATEGY_IDS.CRYPTO_BULL },
  { type: "strategy" as const, strategyId: STRATEGY_IDS.CRYPTO_BEAR },
] as const
