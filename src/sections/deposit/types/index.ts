import { ChainAssetData } from "@galacticcouncil/xcm-core"

export enum DepositScreen {
  Select,
  method,
  DepositAsset,
  Transfer,
  Success,
}

export enum DepositMethod {
  DepositCex,
  DepositOnchain,
  DepositCrypto,
  WithdrawCex,
  WithdrawCrypto,
}

export type AssetConfig = {
  assetId: string
  withdrawalChain: string
  depositChain: string
  data: ChainAssetData
}
