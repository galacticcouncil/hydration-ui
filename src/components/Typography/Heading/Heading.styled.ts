import { colors, fonts, margins } from "utils/styles"
import styled from "@emotion/styled"
import { HeadingProps } from "./Heading"

export const SH1 = styled.h1<HeadingProps>`
  ${fonts};
  ${margins};
  ${colors};
`
