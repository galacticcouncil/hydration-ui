import { FC, ReactNode } from "react"
import { TypographyProps } from "../Typography.utils"
import { SGradientText } from "./GradientText.styled"

interface GradientTextProps extends TypographyProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  children?: ReactNode
  text?: string
}

export const GradientText: FC<GradientTextProps> = ({
  text,
  children,
  ...props
}) => <SGradientText {...props}>{text || children}</SGradientText>
