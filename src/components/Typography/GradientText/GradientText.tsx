import { FontProps, MarginProps } from "utils/styles"
import { FC } from "react"
import { HeadingProps } from "../Heading/Heading"
import { SGradientText } from "./GradientText.styled"

export const GradientText: FC<HeadingProps & FontProps & MarginProps> = ({
  text,
  children,
  ...props
}) => (
  <SGradientText fs={16} {...props}>
    {text || children}
  </SGradientText>
)
