import { colors, fonts, margins } from "utils/styles"
import styled from "styled-components"
import { TextProps } from "./Text"

export const SText = styled.p<TextProps>`
  ${margins};
  ${fonts};
  ${colors};
`
