import { Color, MarginProps } from "common/styles"
import { FC } from "react"
import { StyledSeparator } from "./Separator.styled"

export type SeparatorProps = {
  orientation?: "vertical" | "horizontal"
  color?: Color
  opacity?: number
} & MarginProps

export const Separator: FC<SeparatorProps> = ({
  orientation = "horizontal",
  ...props
}) => <StyledSeparator orientation={orientation} {...props} />
