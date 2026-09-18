import {
  DOT_ASSET_ID,
  getChainId,
  HDX_ASSET_ID,
  HOLLAR_ASSET_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import Big from "big.js"

// Presentation fixtures only. These balances do not represent a connected wallet.
export const DASHBOARD_PREVIEW_STATES = [
  "live",
  "hydration",
  "external",
  "multichain",
  "empty",
] as const

export type DashboardPreviewState =
  | (typeof DASHBOARD_PREVIEW_STATES)[number]
  | "earner"

export type PreviewAsset = {
  id: string
  symbol: string
  name: string
  value: string
  amount: string
  assetKey?: string
}

export const PREVIEW_ASSETS: PreviewAsset[] = [
  {
    id: USDC_ASSET_ID,
    symbol: "USDC",
    name: "USD Coin (Ethereum native)",
    value: "635.53",
    amount: "635.8143",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether (Ethereum native)",
    value: "608.45",
    amount: "608.6272",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether",
    value: "395.80",
    amount: "395.8042",
  },
  {
    id: HOLLAR_ASSET_ID,
    symbol: "HOLLAR",
    name: "Hydration Dollar",
    value: "325.24",
    amount: "325.2400",
  },
  {
    id: DOT_ASSET_ID,
    symbol: "DOT",
    name: "Polkadot",
    value: "145.45",
    amount: "31.1324",
  },
]

export const PREVIEW_EXTERNAL_ASSETS: PreviewAsset[] = [
  {
    id: USDC_ASSET_ID,
    symbol: "USDC",
    name: "USD Coin",
    value: "1840.32",
    amount: "1840.8241",
    assetKey: "usdc",
  },
  {
    id: USDT_ASSET_ID,
    symbol: "USDT",
    name: "Tether",
    value: "979.82",
    amount: "980.0137",
    assetKey: "usdt",
  },
]

const MIXED_HYDRATION_ASSETS: PreviewAsset[] = [
  ...PREVIEW_ASSETS,
  {
    id: HDX_ASSET_ID,
    symbol: "HDX",
    name: "Hydration",
    value: "439.73",
    amount: "87946.0000",
  },
]

const PREVIEW_SOLANA_ASSETS: PreviewAsset[] = [
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    value: "1200.00",
    amount: "8.0000",
    assetKey: "sol",
  },
  {
    id: "jitoSol",
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
    value: "250.00",
    amount: "1.2500",
    assetKey: "jitoSol",
  },
]

const sumAssets = (assets: PreviewAsset[]) =>
  assets.reduce((total, asset) => total.plus(asset.value), Big(0)).toFixed(2)

export const MIXED_HYDRATION_BALANCES = {
  assets: sumAssets(MIXED_HYDRATION_ASSETS),
  liquidity: "704.69",
  borrowed: "28.04",
  rewards: "42.18",
}

export type PortfolioNetworkBalance = {
  key: string
  name: string
  chainId: ReturnType<typeof getChainId>
  ecosystem: NonNullable<ReturnType<typeof chainsMap.get>>["ecosystem"]
  value: string
  assets: PreviewAsset[]
}

const previewNetwork = (
  key: string,
  assets: PreviewAsset[],
  value = sumAssets(assets),
): PortfolioNetworkBalance => {
  const chain = chainsMap.get(key)!
  return {
    key,
    name: chain.name,
    chainId: getChainId(chain),
    ecosystem: chain.ecosystem,
    value,
    assets,
  }
}

export const MIXED_PREVIEW_NETWORKS = [
  previewNetwork(
    "hydration",
    MIXED_HYDRATION_ASSETS,
    Big(MIXED_HYDRATION_BALANCES.assets)
      .plus(MIXED_HYDRATION_BALANCES.liquidity)
      .minus(MIXED_HYDRATION_BALANCES.borrowed)
      .toFixed(2),
  ),
  previewNetwork("ethereum", PREVIEW_EXTERNAL_ASSETS),
  previewNetwork("solana", PREVIEW_SOLANA_ASSETS),
]

export const EXTERNAL_PREVIEW_NETWORKS = [
  previewNetwork("hydration", []),
  previewNetwork("ethereum", PREVIEW_EXTERNAL_ASSETS),
]

export const getPreviewNetWorth = (networks: PortfolioNetworkBalance[]) =>
  networks
    .reduce((total, network) => total.plus(network.value), Big(0))
    .toFixed(2)
