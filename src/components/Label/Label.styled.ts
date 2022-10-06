import styled from "@emotion/styled"
import { Label } from "@radix-ui/react-label"
import { theme } from "theme"
import {
  flex,
  margins,
  FlexProps,
  FontProps,
  MarginProps,
  fonts,
} from "utils/styles"

export const SLabel = styled(Label)<{ error?: string } & FontProps>`
  font-size: 16px;
  line-height: 22px;
  color: ${(p) => (p.error ? theme.colors.error : theme.colors.neutralGray100)};
  text-transform: capitalize;

  ${fonts};
`

export const ErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;
  text-transform: capitalize;
`

export const LabelWrapper = styled.div<
  { $width?: number } & FlexProps & MarginProps
>`
  ${(p) => p.$width && `width: ${p.$width}px`};
  font-size: 0;

  input {
    ${(p) => p.$width && `width: ${p.$width}px;`};
  }

  ${flex};
  ${margins};
`
