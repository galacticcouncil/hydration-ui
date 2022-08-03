import { MarginProps, SizeProps } from "common/styles";
import { ReactNode } from "react";
import { FC } from "react";
import { StyledIconWrapper } from "./Icon.styled";

export type IconProps = {
  children: ReactNode;
  size?: number;
} & SizeProps &
  MarginProps;

export const Icon: FC<IconProps> = ({ children, ...rest }) => {
  return <StyledIconWrapper {...rest}>{children}</StyledIconWrapper>;
};
