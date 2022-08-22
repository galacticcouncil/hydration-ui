import { ColorProps, FontProps, MarginProps } from "utils/styles"
import { FC, ReactNode } from "react"
import { SH1 } from "./Heading.styled"

type variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
export type HeadingProps = {
  as?: variant
  children?: ReactNode
  text?: string
} & FontProps &
  MarginProps &
  ColorProps

export const Heading: FC<HeadingProps> = ({
  children,
  text,
  as = "h1",
  color = "neutralGray100",
  ...rest
}) => (
  <SH1 as={as} color={color} {...rest}>
    {text || children}
  </SH1>
)
