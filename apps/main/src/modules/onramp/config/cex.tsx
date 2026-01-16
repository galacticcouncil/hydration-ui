import {
  BinanceLogo,
  CoinbaseLogo,
  GateIoLogo,
  KrakenLogo,
  KuCoinLogo,
} from "@galacticcouncil/ui/assets/icons"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { EvmParachain } from "@galacticcouncil/xc-core"

const hydration = chainsMap.get("hydration") as EvmParachain

export const CEX_CONFIG = [
  {
    id: "kraken",
    title: "Kraken",
    logo: KrakenLogo,
    assets: [
      {
        assetId: "5",
        minDeposit: 2,
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "0",
        withdrawalChain: "hydration",
        depositChain: "hydration",
        data: hydration.assetsData.get("hdx")!,
      },
    ],
  },
  {
    id: "binance",
    title: "Binance",
    logo: BinanceLogo,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "kucoin",
    title: "KuCoin",
    logo: KuCoinLogo,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "coinbase",
    title: "Coinbase",
    logo: CoinbaseLogo,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("dot")!,
      },
    ],
  },
  {
    id: "gateio",
    title: "Gate.io",
    logo: GateIoLogo,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "assethub",
        depositChain: "polkadot",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        withdrawalChain: "assethub",
        depositChain: "assethub",
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
]

export const CEX_DEPOSIT_LIMITS: Record<string, number> = {
  "5": 2.5,
  "0": 5,
  "10": 4,
  "22": 4,
}

export const CEX_WITHDRAW_LIMITS: Record<string, number> = {
  "5": 2.5,
  "0": 5,
  "10": 4,
  "22": 4,
}

export const createCexWithdrawalUrl = (cexId: string, assetSymbol: string) => {
  const symbol = assetSymbol.toUpperCase()
  const network = symbol === "DOT" ? "Polkadot" : "Hydration"
  const method = symbol === "DOT" ? "Polkadot" : "HydraDX Network"
  switch (cexId) {
    case "kraken":
      return encodeURI(
        `https://www.kraken.com/c/funding/withdraw?asset=${symbol}&network=${network}&method=${method}`,
      )
    case "binance":
      return encodeURI(
        `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${symbol}`,
      )
    case "kucoin":
      return encodeURI(`https://www.kucoin.com/assets/withdraw/${symbol}`)
    case "coinbase":
      return `https://www.coinbase.com`
    case "gateio":
      return encodeURI(`https://www.gate.io/myaccount/withdraw/${symbol}`)
    default:
      return ""
  }
}

export const createDepositId = (assetId: string, address: string) =>
  `${assetId}-${address}`
