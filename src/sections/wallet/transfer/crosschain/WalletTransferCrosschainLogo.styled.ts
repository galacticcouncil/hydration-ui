import styled from "@emotion/styled"
import { theme } from "theme"

export const SIconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: rgba(${theme.rgbColors.white}, 0.08);
  border: 1px solid rgba(${theme.rgbColors.white}, 0.16);
  padding: 10px;
`
