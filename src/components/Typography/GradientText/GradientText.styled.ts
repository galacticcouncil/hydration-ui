import { fonts, margins } from "common/styles"
import styled from "styled-components"
import { theme } from "theme"
import { Heading, HeadingProps } from "../Heading/Heading"

export const StyledGradientText = styled(Heading)<HeadingProps>`
  display: inline-block;
  background: linear-gradient(${theme.gradients.simplifiedGradient});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ${fonts};
  ${margins};
`
