import { PlaceHolderIcon } from "assets/icons/PlaceholderIcon"
import { FC, ReactNode } from "react"
import {
  AssetIconWrapper,
  StyledChainedIcon,
  StyledIcon,
} from "./AssetIcon.styled"

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
    <StyledIcon>{icon || <PlaceHolderIcon />}</StyledIcon>
    {withChainedIcon && (
      <StyledChainedIcon>
        {chainedIcon || <PlaceHolderIcon />}
      </StyledChainedIcon>
    )}
  </AssetIconWrapper>
)
