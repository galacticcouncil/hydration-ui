import { noop } from "common/helpers";
import { ColorProps, MarginProps, SizeProps } from "common/styles";
import { Icon } from "components/Icon/Icon";
import { FC, ReactNode } from "react";
import { StyledIconButton } from "./IconButton.styled";

export type IconButtonProps = {
  round?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
} & SizeProps &
  ColorProps &
  MarginProps;

export const IconButton: FC<IconButtonProps> = ({
  round = true,
  onClick = noop,
  icon,
  ...rest
}) => (
  <StyledIconButton round={round} onClick={onClick} {...rest}>
    <Icon icon={icon} />
  </StyledIconButton>
);
