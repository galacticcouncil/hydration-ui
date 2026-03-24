import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { ComponentType } from "react"

export type MultiplyLoopConfig = {
  supplyAssetId: string
  borrowAssetId: string
  assetInId: string
  assetOutId: string
  isParityPair: boolean
  enterWithAssetId?: string
}

export type MultiplyAssetPair = {
  name?: string
  icon?: ComponentType
  collateralAssetId: string
  debtAssetId: string
  enterWithAssetId?: string
  isParityPair: boolean
  eModeCategory: EModeCategory
}

export type MultiplyAssetPairConfig = {
  id: string
} & MultiplyAssetPair
