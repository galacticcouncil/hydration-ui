import { FontProps, MarginProps } from "common/styles"
import { FC } from "react"
import { TextProps } from "../Text/Text"
import { StyledGradientText } from "./GradientText.styled"

export const GradientText: FC<TextProps & FontProps & MarginProps> = ({
  text,
  children,
  ...props
}) => (
  <StyledGradientText fs={16} {...props}>
    {text || children}
  </StyledGradientText>
)
