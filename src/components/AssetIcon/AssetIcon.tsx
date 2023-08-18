import * as React from "react"
import { createComponent } from "@lit-labs/react"
import {
  AssetId,
  ChainLogo as ChainLogoUi,
  PlaceholderLogo,
} from "@galacticcouncil/ui"
import { PolkadotRegistry } from "@galacticcouncil/sdk"
import { useAssetsLocation } from "api/assetDetails"
import { assetPlaceholderCss } from "./AssetIcon.styled"
import { useMemo } from "react"

const registry = new PolkadotRegistry()
console.log(registry)

export const UigcAssetPlaceholder = createComponent({
  tagName: "uigc-logo-placeholder",
  elementClass: PlaceholderLogo,
  react: React,
})

export const UigcAssetId = createComponent({
  tagName: "uigc-asset-id",
  elementClass: AssetId,
  react: React,
})

export const UigcChainLogo = createComponent({
  tagName: "uigc-logo-chain",
  elementClass: ChainLogoUi,
  react: React,
})

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

export const AssetLogo = ({ symbol }: { symbol?: string }) => {
  const locations = useAssetsLocation()

  const chain = useMemo(() => {
    if (!locations.data) return undefined

    const location = locations.data?.find(
      (location) => location.symbol === symbol,
    )

    return registry
      .getChains()
      .find((chain) => chain.paraID === location?.parachainId)
  }, [symbol, locations])

  if (!symbol)
    return (
      <UigcAssetPlaceholder
        css={assetPlaceholderCss}
        ref={(el) => el && el.setAttribute("fit", "")}
        slot="placeholder"
      />
    )

  return (
    <UigcAssetId
      css={{ "& uigc-logo-chain": { display: "none" } }}
      ref={(el) => {
        el && chain?.id && el.setAttribute("chain", chain?.id)
        el && el.setAttribute("fit", "")
        // el && el.setAttribute("style", `display: none`)
        //el && el.setAttribute("styles", { display: "none" })
      }}
      symbol={symbol}
      chain={chain?.id}
    />
  )
}

export const ChainLogo = ({ symbol }: { symbol?: string }) => {
  return (
    <UigcChainLogo
      chain={symbol}
      ref={(el) => el && el.setAttribute("fit", "")}
    >
      <UigcAssetPlaceholder
        css={assetPlaceholderCss}
        ref={(el) => el && el.setAttribute("fit", "")}
        slot="placeholder"
      />
    </UigcChainLogo>
  )
}
