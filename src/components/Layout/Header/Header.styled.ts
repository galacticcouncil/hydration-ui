import styled from "@emotion/styled"
import { theme } from "theme"

export const SHeader = styled.header`
  background: rgba(${theme.rgbColors.backgroundGray1000}, 0.6);
  padding: 6px 12px;

  @media (${theme.viewport.gte.sm}) {
    padding: 16px 30px;
  }
`
