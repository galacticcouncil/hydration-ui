import { noop } from "common/helpers";
import { FC, ReactNode } from "react";
import { StyledIconButton } from "./IconButton.styled";

export type IconButtonProps = {
  children: ReactNode;
  round?: boolean;
  onClick?: () => void;
};

export const IconButton: FC<IconButtonProps> = ({
  children,
  round = true,
  onClick = noop,
}) => <StyledIconButton round={round}>{children}</StyledIconButton>;
