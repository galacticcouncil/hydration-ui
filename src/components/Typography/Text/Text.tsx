import { ColorProps, FontProps, MarginProps } from "common/styles"
import { FC, ReactNode } from "react"
import { StyledText } from "./Text.styled"
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
  <StyledText {...rest} fw={fw} fs={fs} color={color}>
    {text || children}
  </StyledText>
)
