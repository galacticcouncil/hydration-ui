import { colors, fonts, margins } from "common/styles"
import styled from "styled-components/macro"
import { HeadingProps } from "./Heading"

export const StyledH1 = styled.h1<HeadingProps>`
  ${fonts};
  ${margins};
  ${colors};
`
