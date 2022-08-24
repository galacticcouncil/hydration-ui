import { FC, InputHTMLAttributes, ReactNode } from "react"
import { SBox } from "./Box.styled"
import {
  MarginProps,
  PaddingProps,
  FlexProps,
  SizeProps,
  ColorProps,
} from "utils/styles"

export type BoxProps = InputHTMLAttributes<HTMLDivElement> & {
  children: ReactNode
} & MarginProps &
  PaddingProps &
  FlexProps &
  SizeProps &
  ColorProps

export const Box: FC<BoxProps> = ({ children, ...rest }) => (
  <SBox {...rest}>{children}</SBox>
)
