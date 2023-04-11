import * as React from "react"
import { createComponent } from "@lit-labs/react"
import { AssetLogo } from "@galacticcouncil/ui"

export const UigcAssetLogo = createComponent({
  tagName: "uigc-logo-asset",
  elementClass: AssetLogo,
  react: React,
})

export function getAssetLogo(symbol: string | null | undefined) {
  return (
    <UigcAssetLogo
      ref={(el) => el && el.setAttribute("fit", "")}
      asset={symbol}
    ></UigcAssetLogo>
  )
}

export function getAssetName(symbol: string | null | undefined) {
  const _symbol = symbol?.toUpperCase()

  if (_symbol === "AUSD") return "Acala Dollar"
  if (_symbol === "BSX") return "Basilisk"
  if (_symbol === "KAR") return "Karura"
  if (_symbol === "KSM") return "Kusama"
  if (_symbol === "PHA") return "Phala"
  if (_symbol === "TNKR") return "Tinkernet"
  if (_symbol === "HDX") return "HydraDX"
  if (_symbol === "LRNA") return "Lerna"
  if (_symbol === "DAI") return "Dai"
  if (_symbol === "DOT") return "Polkadot"
  if (_symbol === "BTC") return "Bitcoin"
  if (_symbol === "ETH") return "Ethereum"
  if (_symbol === "USDC") return "USD Coin"
  if (_symbol === "USDT") return "Tether"
  if (_symbol === "APE") return "ApeCoin"
  if (_symbol === "ASTR") return "Astar"
  if (_symbol === "IBTC") return "interBTC"

  return "N/A"
}
