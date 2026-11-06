import {
  DOT_ASSET_ID,
  getAddressFromAssetId,
  HDX_ASSET_ID,
  HOLLAR_ASSET_ID,
  PRIME_ASSET_ID,
  VDOT_ASSET_ID,
} from "@galacticcouncil/utils"
import { type Hex, parseUnits } from "viem"

import { ENV } from "@/config/env"
import { HOLLAR_ADDRESS } from "@/modules/strategies/bil/config/constants"

export const LOOPER_FACTORY_ADDRESS = ENV.VITE_LOOPER_FACTORY_ADDRESS as
  | Hex
  | undefined

export type MultiplyPair = {
  slug: string
  collateralAssetId: string
  debtAssetId: string
  collateral: Hex
  aCollateral: Hex
  debt: Hex
  variableDebt: Hex
  aCollateralAssetId: number
  eMode: number
  // WAD
  minHf: bigint
  stepHf: bigint
  slippageBps: number
  feeAssetId: string
  feeAsset: Hex
  // fee asset base units
  feeReserve: bigint
  feeBudget: bigint
}

// What every pair shares unless it is tuned: presets and custom loops alike.
const MULTIPLY_DEFAULTS = {
  minHf: parseUnits("1.10", 18),
  stepHf: parseUnits("1.05", 18),
  slippageBps: 100,
  feeAssetId: HDX_ASSET_ID,
  feeAsset: getAddressFromAssetId(HDX_ASSET_ID) as Hex,
  // ponytail: placeholders until the lark3 measurement ticket (#101) sizes the per-callback fee
  feeReserve: parseUnits("5", 12),
  feeBudget: parseUnits("100", 12),
} satisfies Partial<MultiplyPair>

export const MULTIPLY_PAIRS: MultiplyPair[] = [
  {
    ...MULTIPLY_DEFAULTS,
    slug: "prime-hollar",
    collateralAssetId: PRIME_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    collateral: getAddressFromAssetId(PRIME_ASSET_ID) as Hex,
    aCollateral: "0x4C892a298A9C6b4cEd988b3D6E9CF93333aADcF7",
    debt: HOLLAR_ADDRESS,
    variableDebt: "0x342923782cCaEBf9c38DD9cb40436e82C42c73B5",
    aCollateralAssetId: 1043,
    eMode: 0,
  },
  {
    ...MULTIPLY_DEFAULTS,
    slug: "vdot-dot",
    collateralAssetId: VDOT_ASSET_ID,
    debtAssetId: DOT_ASSET_ID,
    collateral: getAddressFromAssetId(VDOT_ASSET_ID) as Hex,
    aCollateral: "0x0e13b904F4168F93814216B6874cA8349457f263",
    debt: getAddressFromAssetId(DOT_ASSET_ID) as Hex,
    variableDebt: "0x34321CB7334807eb718B3E1DdFaEb0c6c0403F1A",
    aCollateralAssetId: 1005,
    // DOT-correlated category, entered by the position contract on open
    eMode: 2,
  },
]

export const getMultiplyPair = (slug: string) =>
  MULTIPLY_PAIRS.find((pair) => pair.slug === slug)

const CUSTOM_LOOP_PREFIX = "custom-"

export const getCustomLoopSlug = (
  collateralAssetId: string,
  debtAssetId: string,
) => `${CUSTOM_LOOP_PREFIX}${collateralAssetId}-${debtAssetId}`

export const isCustomLoop = (pair: Pick<MultiplyPair, "slug">) =>
  pair.slug.startsWith(CUSTOM_LOOP_PREFIX)

export const findPairByAssets = (
  pairs: MultiplyPair[],
  collateralAssetId: string,
  debtAssetId: string,
) =>
  pairs.find(
    (p) =>
      p.collateralAssetId === collateralAssetId &&
      p.debtAssetId === debtAssetId,
  )

/** A custom loop: the reserves' own addresses and ids, everything else the defaults. */
export const buildCustomLoop = (
  loop: Pick<
    MultiplyPair,
    | "collateralAssetId"
    | "debtAssetId"
    | "collateral"
    | "aCollateral"
    | "debt"
    | "variableDebt"
    | "aCollateralAssetId"
    | "eMode"
  >,
): MultiplyPair => ({
  ...MULTIPLY_DEFAULTS,
  ...loop,
  slug: getCustomLoopSlug(loop.collateralAssetId, loop.debtAssetId),
})
