import { PlaceHolderIcon } from "assets/icons/tokens/PlaceholderIcon"
import { FC, ReactNode } from "react"
import { AssetIconWrapper, SChainedIcon, SIcon } from "./AssetIcon.styled"

import { ReactComponent as AUSD } from "assets/icons/tokens/AUSD.svg"
import { ReactComponent as BSX } from "assets/icons/tokens/BSX.svg"
import { ReactComponent as KAR } from "assets/icons/tokens/KAR.svg"
import { ReactComponent as PHA } from "assets/icons/tokens/PHA.svg"
import { ReactComponent as KSM } from "assets/icons/tokens/KSM.svg"
import { ReactComponent as TNKR } from "assets/icons/tokens/TNKR.svg"
import { ReactComponent as HDX } from "assets/icons/tokens/HDX.svg"
import { ReactComponent as LRNA } from "assets/icons/tokens/LRNA.svg"
import { ReactComponent as DAI } from "assets/icons/tokens/DAI.svg"
import { ReactComponent as DOT } from "assets/icons/tokens/DOT.svg"
import { ReactComponent as BTC } from "assets/icons/tokens/BTC.svg"
import { ReactComponent as ETH } from "assets/icons/tokens/ETH.svg"
import { ReactComponent as USDC } from "assets/icons/tokens/USDC.svg"
import { ReactComponent as USDT } from "assets/icons/tokens/USDT.svg"
import { ReactComponent as PlaceholderIcon } from "assets/icons/tokens/PlaceholderIcon.svg"

export type AssetIconProps = {
  icon?: ReactNode
  chainedIcon?: ReactNode
  withChainedIcon?: boolean
}

export const AssetIcon: FC<AssetIconProps> = ({
  icon,
  chainedIcon,
  withChainedIcon = false,
}) => (
  <AssetIconWrapper>
    <SIcon>{icon || <PlaceHolderIcon />}</SIcon>
    {withChainedIcon && (
      <SChainedIcon>{chainedIcon || <PlaceHolderIcon />}</SChainedIcon>
    )}
  </AssetIconWrapper>
)

export function getAssetLogo(symbol: string | null | undefined) {
  const _symbol = symbol?.toUpperCase()

  if (_symbol === "AUSD") return <AUSD />
  if (_symbol === "BSX") return <BSX />
  if (_symbol === "KAR") return <KAR />
  if (_symbol === "KSM") return <KSM />
  if (_symbol === "PHA") return <PHA />
  if (_symbol === "TNKR") return <TNKR />
  if (_symbol === "HDX") return <HDX />
  if (_symbol === "LRNA") return <LRNA />
  if (_symbol === "DAI") return <DAI />
  if (_symbol === "DOT") return <DOT />
  if (_symbol === "BTC") return <BTC />
  if (_symbol === "ETH") return <ETH />
  if (_symbol === "USDC") return <USDC />
  if (_symbol === "USDT") return <USDT />

  return <PlaceholderIcon width={32} height={32} />
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

  return "N/A"
}
