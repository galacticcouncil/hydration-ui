import { FC, ReactNode } from "react"
import { SBox } from "./Box.styled"
import {
  MarginProps,
  PaddingProps,
  FlexProps,
  SizeProps,
  ColorProps,
} from "utils/styles"

export type BoxProps = {
  children: ReactNode
} & MarginProps &
  PaddingProps &
  FlexProps &
  SizeProps &
  ColorProps

export const Box: FC<BoxProps> = ({ children, ...rest }) => (
  <SBox {...rest}>{children}</SBox>
)
