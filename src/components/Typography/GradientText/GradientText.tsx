import { FontProps, MarginProps } from "common/styles"
import { FC } from "react"
import { HeadingProps } from "../Heading/Heading"
import { StyledGradientText } from "./GradientText.styled"

export const GradientText: FC<HeadingProps & FontProps & MarginProps> = ({
  text,
  children,
  ...props
}) => (
  <StyledGradientText fs={16} {...props}>
    {text || children}
  </StyledGradientText>
)
