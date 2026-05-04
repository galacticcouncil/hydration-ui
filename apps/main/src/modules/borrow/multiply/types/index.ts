import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { ComponentType } from "react"

export type MultiplyLoopConfig = {
  supplyAssetId: string
  borrowAssetId: string
  assetInId: string
  assetOutId: string
  enterWithAssetId?: string
}

export type MultiplyAssetPairConfig = {
  id: string
  collateralAssetId: string
  debtAssetId: string
  enterWithAssetId?: string
  eModeCategory: EModeCategory
  name?: string
  icon?: ComponentType
}

export type MultiplyAssetPair = Omit<MultiplyAssetPairConfig, "id">

export type MultiplyStrategyConfig = {
  id: string
  name: string
  icon: ComponentType
  pairIds: readonly string[]
}
