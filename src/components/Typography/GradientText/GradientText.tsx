import { FC, ReactNode } from "react"
import { TypographyProps } from "../Typography.utils"
import { SGradientText } from "./GradientText.styled"
import { theme } from "theme"

export interface GradientTextProps extends TypographyProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  children?: ReactNode
  text?: string
  gradient?: keyof typeof theme.gradients
}

export const GradientText: FC<GradientTextProps> = ({
  text,
  children,
  gradient,
  ...props
}) => (
  <SGradientText gradient={gradient} {...props}>
    {text || children}
  </SGradientText>
)
