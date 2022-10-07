import { FC, ReactNode } from "react"
import { TypographyProps } from "../Typography.utils"
import { SHeading } from "./Heading.styled"

interface HeadingProps extends TypographyProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  children?: ReactNode
  text?: string
}

export const Heading: FC<HeadingProps> = ({
  children,
  text,
  color,
  as = "h1",
  ...rest
}) => (
  <SHeading as={as} $color={color} {...rest}>
    {text || children}
  </SHeading>
)
