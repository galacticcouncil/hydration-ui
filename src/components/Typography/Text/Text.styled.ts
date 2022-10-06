import {
  ColorProps,
  colors,
  FontProps,
  fonts,
  MarginProps,
  margins,
} from "utils/styles"
import styled from "@emotion/styled"

export const SText = styled.p<ColorProps & MarginProps & FontProps>`
  ${margins};
  ${fonts};
  ${colors};
`
