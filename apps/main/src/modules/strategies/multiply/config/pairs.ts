import {
  getAddressFromAssetId,
  HDX_ASSET_ID,
  HOLLAR_ASSET_ID,
  PRIME_ASSET_ID,
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
  // ponytail: placeholders until the lark3 measurement ticket (#101) sizes the per-callback fee
  feeReserve: bigint
  feeBudget: bigint
}

export const MULTIPLY_PAIRS: MultiplyPair[] = [
  {
    slug: "prime-hollar",
    collateralAssetId: PRIME_ASSET_ID,
    debtAssetId: HOLLAR_ASSET_ID,
    collateral: getAddressFromAssetId(PRIME_ASSET_ID) as Hex,
    aCollateral: "0x4C892a298A9C6b4cEd988b3D6E9CF93333aADcF7",
    debt: HOLLAR_ADDRESS,
    variableDebt: "0x342923782cCaEBf9c38DD9cb40436e82C42c73B5",
    aCollateralAssetId: 1043,
    eMode: 0,
    minHf: parseUnits("1.10", 18),
    stepHf: parseUnits("1.05", 18),
    slippageBps: 100,
    feeAssetId: HDX_ASSET_ID,
    feeAsset: getAddressFromAssetId(HDX_ASSET_ID) as Hex,
    feeReserve: parseUnits("5", 12),
    feeBudget: parseUnits("100", 12),
  },
]

export const getMultiplyPair = (slug: string) =>
  MULTIPLY_PAIRS.find((pair) => pair.slug === slug)
