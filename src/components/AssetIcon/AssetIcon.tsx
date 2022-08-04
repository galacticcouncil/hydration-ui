import { PlaceHolderIcon } from "assets/icons/PlaceholderIcon";
import { FC, ReactNode } from "react";
import {
  AssetIconWrapper,
  StyledChainedIcon,
  StyledIcon,
} from "./AssetIconWrapper";

type AssetIconProps = {
  icon?: ReactNode;
  chainedIcon?: ReactNode;
};

export const AssetIcon: FC<AssetIconProps> = ({ icon, chainedIcon }) => (
  <AssetIconWrapper>
    <StyledIcon>{icon || <PlaceHolderIcon />}</StyledIcon>
    <StyledChainedIcon>{chainedIcon || <PlaceHolderIcon />}</StyledChainedIcon>
  </AssetIconWrapper>
);
