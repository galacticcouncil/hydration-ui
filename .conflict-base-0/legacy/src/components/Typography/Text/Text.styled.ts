import styled from "@emotion/styled"
import { theme } from "theme"
import {
  STypographyProps,
  handleTypographyProps,
} from "components/Typography/Typography.utils"

export const SText = styled.p<STypographyProps>`
  color: ${theme.colors.basic100};
  font-weight: 500;
  font-size: 16px;

  ${handleTypographyProps}
`
