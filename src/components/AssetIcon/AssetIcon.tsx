import { PlaceHolderIcon } from "assets/icons/PlaceholderIcon"
import { FC, ReactNode } from "react"
import { AssetIconWrapper, SChainedIcon, SIcon } from "./AssetIcon.styled"

export type AssetIconProps = {
  icon?: ReactNode
  chainedIcon?: ReactNode
  withChainedIcon?: boolean
}

export const AssetIcon: FC<AssetIconProps> = ({
  icon,
  chainedIcon,
  withChainedIcon = true,
}) => (
  <AssetIconWrapper>
    <SIcon>{icon || <PlaceHolderIcon />}</SIcon>
    {withChainedIcon && (
      <SChainedIcon>{chainedIcon || <PlaceHolderIcon />}</SChainedIcon>
    )}
  </AssetIconWrapper>
)
