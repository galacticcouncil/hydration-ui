import { colors, fonts, margins } from "common/styles"
import styled from "styled-components"
import { TextProps } from "./Text"

export const StyledText = styled.p<TextProps>`
  ${margins};
  ${fonts};
  ${colors};
`
