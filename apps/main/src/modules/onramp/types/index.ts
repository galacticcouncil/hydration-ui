import { ChainAssetData } from "@galacticcouncil/xc-core"

export enum CexId {
  Kraken = "kraken",
  Binance = "binance",
  Kucoin = "kucoin",
  Coinbase = "coinbase",
  Gateio = "gateio",
}

export enum DepositScreen2 {
  Select = "Select",
  Method = "Method",
  DepositAsset = "DepositAsset",
  Transfer = "Transfer",
  Success = "Success",
}

export enum DepositMethod2 {
  DepositCex = "DepositCex",
  DepositOnchain = "DepositOnchain",
  DepositBank = "DepositBank",
  WithdrawCex = "WithdrawCex",
  WithdrawCrypto = "WithdrawCrypto",
  WithdrawBank = "WithdrawBank",
}

export enum OnrampScreen {
  MethodSelect = "MethodSelect",

  DepositAssetSelect = "DepositAssetSelect",
  DepositAsset = "DepositAsset",
  DepositTransfer = "DepositTransfer",
  DepositBank = "DepositBank",
  DepositSuccess = "DepositSuccess",

  WithdrawAssetSelect = "WithdrawAssetSelect",
  WithdrawAsset = "WithdrawAsset",
  WithdrawTransfer = "WithdrawTransfer",
  WithdrawBank = "WithdrawBank",
  WithdrawSuccess = "WithdrawSuccess",
}

export type AssetConfig = {
  assetId: string
  withdrawalChain: string
  depositChain: string
  data: ChainAssetData
  minDeposit: number
  minWithdraw: number
}

export type DepositConfig = {
  id: string
  cexId: CexId
  asset: AssetConfig
  address: string
  createdAt: number
  amount: string
  balanceSnapshot: string
}
