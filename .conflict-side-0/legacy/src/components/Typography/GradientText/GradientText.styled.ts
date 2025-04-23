import styled from "@emotion/styled"
import { theme } from "theme"
import { Heading } from "components/Typography/Heading/Heading"
import { handleTypographyProps } from "components/Typography/Typography.utils"
import { GradientTextProps } from "./GradientText"

export const SGradientText = styled(Heading)<GradientTextProps>`
  font-size: 16px;
  display: inline-block;
  background: ${({ gradient }) =>
    gradient ? theme.gradients[gradient] : theme.gradients.pinkLightPink};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${handleTypographyProps}
`
