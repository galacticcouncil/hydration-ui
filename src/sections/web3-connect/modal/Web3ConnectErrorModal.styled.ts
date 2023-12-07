import styled from "@emotion/styled"
import { theme } from "theme"

export const SErrorMessage = styled.p`
  color: ${theme.colors.error};
  background: rgba(${theme.rgbColors.error}, 0.05);

  padding: 12px;

  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.default}px;
`
