import { ChainAssetData } from "@galacticcouncil/xc-core"

export enum DepositScreen {
  Select,
  Method,
  DepositAsset,
  Transfer,
  Success,
}

export enum DepositMethod {
  DepositCex,
  DepositOnchain,
  DepositBank,
}

export type AssetConfig = {
  assetId: string
  withdrawalChain: string
  depositChain: string
  data: ChainAssetData
}

export type DepositConfig = {
  id: string
  cexId: string
  asset: AssetConfig
  address: string
  createdAt: number
  amount: string
  balanceSnapshot: string
}
