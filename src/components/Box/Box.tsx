import { FC, ReactNode } from "react";
import { StyledBox } from "./Box.styled";
import {
  MarginProps,
  PaddingProps,
  FlexProps,
  SizeProps,
  ColorProps,
} from "common/styles";

export type BoxProps = {
  children: ReactNode;
} & MarginProps &
  PaddingProps &
  FlexProps &
  SizeProps &
  ColorProps;

export const Box: FC<BoxProps> = ({ children, ...rest }) => (
  <StyledBox {...rest}>{children}</StyledBox>
);
