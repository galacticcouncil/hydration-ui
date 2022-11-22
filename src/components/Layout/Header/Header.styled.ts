import styled from "@emotion/styled"
import { theme } from "theme"

export const SHeader = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.header};

  padding: 6px 12px;

  backdrop-filter: blur(16px);
  background: rgba(${theme.rgbColors.backgroundGray1000}, 0.2);

  @media ${theme.viewport.gte.sm} {
    padding: 6px 30px;
  }
`
