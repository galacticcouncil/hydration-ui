import { Color, MarginProps } from "utils/styles"
import { FC } from "react"
import { SSeparator } from "./Separator.styled"

export type SeparatorProps = {
  orientation?: "vertical" | "horizontal"
  color?: Color
  opacity?: number
  size?: number
} & MarginProps

export const Separator: FC<SeparatorProps> = ({
  orientation = "horizontal",
  ...props
}) => <SSeparator orientation={orientation} {...props} />
