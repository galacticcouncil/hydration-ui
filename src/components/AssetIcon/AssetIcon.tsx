import { PlaceHolderIcon } from "assets/icons/PlaceholderIcon"
import { FC, ReactNode } from "react"
import { AssetIconWrapper, SChainedIcon, SIcon } from "./AssetIcon.styled"

import { ReactComponent as AUSD } from "assets/icons/tokens/AUSD.svg"
import { ReactComponent as BSX } from "assets/icons/tokens/BSX.svg"
import { ReactComponent as KAR } from "assets/icons/tokens/KAR.svg"
import { ReactComponent as KSM } from "assets/icons/tokens/KSM.svg"

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

export function getAssetLogo(assetName: string | null | undefined) {
  if (assetName == null) return undefined

  if (assetName === "AUSD") return <AUSD />
  if (assetName === "BSX") return <BSX />
  if (assetName === "KAR") return <KAR />
  if (assetName === "KSM") return <KSM />

  return undefined
}
