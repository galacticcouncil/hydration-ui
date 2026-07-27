import {
  BinanceLogo,
  CoinbaseLogo,
  GateioLogo,
  KrakenLogo,
  KucoinLogo,
} from "@galacticcouncil/ui/assets/icons"
import {
  DOT_ASSET_ID,
  HDX_ASSET_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { EvmParachain } from "@galacticcouncil/xc-core"
import { ComponentType } from "react"

import { AssetConfig, CexId } from "@/modules/onramp/types"

type CexConfig = {
  id: CexId
  logo: ComponentType
  assets: AssetConfig[]
}

const hydration = chainsMap.get("hydration") as EvmParachain

const SUPPORTED_ASSETS = {
  HDX: {
    assetId: HDX_ASSET_ID,
    withdrawalChain: "hydration",
    depositChain: "hydration",
    data: hydration.assetsData.get("hdx")!,
    minDeposit: 15,
    minWithdraw: 15,
  },
  DOT: {
    assetId: DOT_ASSET_ID,
    withdrawalChain: "assethub",
    depositChain: "assethub",
    data: hydration.assetsData.get("dot")!,
    minDeposit: 2,
    minWithdraw: 2,
  },
  USDT: {
    assetId: USDT_ASSET_ID,
    withdrawalChain: "assethub",
    depositChain: "assethub",
    data: hydration.assetsData.get("usdt")!,
    minDeposit: 4,
    minWithdraw: 4,
  },
  USDC: {
    assetId: USDC_ASSET_ID,
    withdrawalChain: "assethub",
    depositChain: "assethub",
    data: hydration.assetsData.get("usdc")!,
    minDeposit: 4,
    minWithdraw: 4,
  },
} satisfies Record<string, AssetConfig>

export const CEX_CONFIG: CexConfig[] = [
  {
    id: CexId.Kraken,
    logo: KrakenLogo,
    assets: [SUPPORTED_ASSETS.HDX, SUPPORTED_ASSETS.DOT],
  },
  {
    id: CexId.Binance,
    logo: BinanceLogo,
    assets: [
      SUPPORTED_ASSETS.DOT,
      SUPPORTED_ASSETS.USDT,
      SUPPORTED_ASSETS.USDC,
    ],
  },
  {
    id: CexId.Kucoin,
    logo: KucoinLogo,
    assets: [
      SUPPORTED_ASSETS.DOT,
      SUPPORTED_ASSETS.USDT,
      SUPPORTED_ASSETS.USDC,
    ],
  },
  {
    id: CexId.Coinbase,
    logo: CoinbaseLogo,
    assets: [SUPPORTED_ASSETS.DOT],
  },
  {
    id: CexId.Gateio,
    logo: GateioLogo,
    assets: [
      SUPPORTED_ASSETS.DOT,
      SUPPORTED_ASSETS.USDT,
      SUPPORTED_ASSETS.USDC,
    ],
  },
]

export const createCexWithdrawalUrl = (cexId: string, assetSymbol: string) => {
  const symbol = assetSymbol.toUpperCase()
  const network = symbol === "DOT" ? "Polkadot" : "Hydration"
  const method = symbol === "DOT" ? "Polkadot" : "HydraDX Network"
  switch (cexId) {
    case CexId.Kraken:
      return encodeURI(
        `https://www.kraken.com/c/funding/withdraw?asset=${symbol}&network=${network}&method=${method}`,
      )
    case CexId.Binance:
      return encodeURI(
        `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${symbol}`,
      )
    case CexId.Kucoin:
      return encodeURI(`https://www.kucoin.com/assets/withdraw/${symbol}`)
    case CexId.Coinbase:
      return `https://www.coinbase.com`
    case CexId.Gateio:
      return encodeURI(`https://www.gate.io/myaccount/withdraw/${symbol}`)
    default:
      return ""
  }
}

export const createDepositId = (assetId: string, address: string) =>
  `${assetId}-${address}`

export const getCexConfigById = (id: CexId) =>
  CEX_CONFIG.find((c) => c.id === id)

export const getCexAssetConfig = (cexId: CexId, assetId: string) =>
  getCexConfigById(cexId)?.assets.find((asset) => asset.assetId === assetId)
