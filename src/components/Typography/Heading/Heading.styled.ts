import styled from "@emotion/styled"
import { theme } from "theme"
import {
  handleTypographyProps,
  STypographyProps,
} from "components/Typography/Typography.utils"

export const SHeading = styled.h1<STypographyProps>`
  color: ${theme.colors.basic100};
  font-family: Geist;

  ${handleTypographyProps}
`
