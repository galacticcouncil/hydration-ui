import { FC, ReactNode } from "react";
import { StyledBox } from "./Box.styled";
import {
  MarginProps,
  PaddingProps,
  FlexProps,
  SizeProps,
  ColorProps,
} from "common/styles";

export type BoxTypes = {
  children: ReactNode;
} & MarginProps &
  PaddingProps &
  FlexProps &
  SizeProps &
  ColorProps;

export const Box: FC<BoxTypes> = ({ children, ...rest }) => (
  <StyledBox {...rest}>{children}</StyledBox>
);
