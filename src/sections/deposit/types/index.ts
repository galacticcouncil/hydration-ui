import { ChainAssetData } from "@galacticcouncil/xcm-core"

export enum DepositScreen {
  Select,
  DepositMethod,
  DepositAsset,
  Transfer,
}

export enum DepositMethod {
  DepositCex,
  DepositOnchain,
  DepositCrypto,
}

export type AssetConfig = {
  assetId: string
  route: string[]
  data: ChainAssetData
}
