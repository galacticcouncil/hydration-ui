import { ElementType, FC, ReactNode } from "react"
import { SText } from "./Text.styled"
import { TypographyProps } from "components/Typography/Typography.utils"

export interface TextProps extends TypographyProps {
  children?: ReactNode
  text?: string | number
  className?: string
  as?: ElementType
}

export const Text: FC<TextProps> = ({ children, text, color, ...rest }) => (
  <SText $color={color} {...rest}>
    {text || children}
  </SText>
)
