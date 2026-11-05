import {
  DOT_ASSET_ID,
  ETH_ASSET_ID,
  HDX_ASSET_ID,
  HOLLAR_ASSET_ID,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"

export type PortfolioDepositSample = {
  id: string
  assetId: string
  symbol: string
  amount: string
  source: string
  network: string
  method: "onchain" | "exchange" | "bank" | "crypto"
  status:
    | "awaiting"
    | "processing"
    | "confirming"
    | "claimable"
    | "completed"
    | "attention"
    | "failed"
  createdAt: number
}

// Presentation fixtures only. They never enter deposit stores or transaction APIs.
const previewNow = Date.now()
const minute = 60 * 1000
const hour = 60 * minute

export const portfolioDepositSamples: PortfolioDepositSample[] = [
  {
    id: "sample-bank-usd",
    assetId: HOLLAR_ASSET_ID,
    symbol: "HOLLAR",
    amount: "500",
    source: "USD",
    network: "ACH / wire",
    method: "bank",
    status: "awaiting",
    createdAt: previewNow - 12 * minute,
  },
  {
    id: "sample-bank-eur",
    assetId: HOLLAR_ASSET_ID,
    symbol: "HOLLAR",
    amount: "250",
    source: "EUR",
    network: "SEPA",
    method: "bank",
    status: "processing",
    createdAt: previewNow - 35 * minute,
  },
  {
    id: "sample-ethereum-usdc",
    assetId: USDC_ASSET_ID,
    symbol: "USDC",
    amount: "1250",
    source: "Ethereum",
    network: "Ethereum",
    method: "onchain",
    status: "claimable",
    createdAt: previewNow - 48 * minute,
  },
  {
    id: "sample-arbitrum-usdc",
    assetId: USDC_ASSET_ID,
    symbol: "USDC",
    amount: "625",
    source: "Arbitrum",
    network: "Arbitrum",
    method: "onchain",
    status: "confirming",
    createdAt: previewNow - 75 * minute,
  },
  {
    id: "sample-kraken-dot",
    assetId: DOT_ASSET_ID,
    symbol: "DOT",
    amount: "80",
    source: "Kraken",
    network: "AssetHub",
    method: "exchange",
    status: "awaiting",
    createdAt: previewNow - 2 * hour,
  },
  {
    id: "sample-assethub-usdt",
    assetId: USDT_ASSET_ID,
    symbol: "USDT",
    amount: "2400",
    source: "AssetHub",
    network: "Polkadot",
    method: "onchain",
    status: "completed",
    createdAt: previewNow - 5 * hour,
  },
  {
    id: "sample-kraken-hdx",
    assetId: HDX_ASSET_ID,
    symbol: "HDX",
    amount: "15000",
    source: "Kraken",
    network: "Hydration",
    method: "exchange",
    status: "completed",
    createdAt: previewNow - 22 * hour,
  },
  {
    id: "sample-hydration-usdc",
    assetId: USDC_ASSET_ID,
    symbol: "USDC",
    amount: "325",
    source: "Hydration",
    network: "Hydration",
    method: "crypto",
    status: "completed",
    createdAt: previewNow - 28 * hour,
  },
  {
    id: "sample-base-eth",
    assetId: ETH_ASSET_ID,
    symbol: "ETH",
    amount: "0.15",
    source: "Base",
    network: "Base",
    method: "onchain",
    status: "failed",
    createdAt: previewNow - 46 * hour,
  },
]
