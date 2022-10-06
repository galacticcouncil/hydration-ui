import { fonts, margins } from "utils/styles"
import styled from "@emotion/styled"
import { theme } from "theme"
import { Heading, HeadingProps } from "../Heading/Heading"

export const SGradientText = styled(Heading)<HeadingProps>`
  display: inline-block;
  background: linear-gradient(${theme.gradients.simplifiedGradient});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ${fonts};
  ${margins};
`
