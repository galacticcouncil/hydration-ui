import { ColorProps, FontProps, MarginProps } from "utils/styles"
import { FC, ReactNode } from "react"
import { SText } from "./Text.styled"
import { StyledProps } from "styled-components"

export type TextProps = {
  children?: ReactNode
  text?: string | number
  className?: string
} & ColorProps &
  MarginProps &
  FontProps &
  StyledProps<any>

export const Text: FC<TextProps> = ({
  children,
  text,
  fw = 500,
  fs = 16,
  color = "neutralGray100",
  ...rest
}) => (
  <SText {...rest} fw={fw} fs={fs} color={color}>
    {text || children}
  </SText>
)
