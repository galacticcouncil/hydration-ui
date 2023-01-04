import styled from "@emotion/styled"
import { theme } from "theme"
import { ReactComponent as BellIcon } from "assets/icons/BellIcon.svg"

export const SHeader = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.header};

  padding: 6px 12px;

  backdrop-filter: blur(16px);
  background: rgba(${theme.rgbColors.black}, 0.2);

  @media ${theme.viewport.gte.sm} {
    padding: 8px 40px 8px 0;
  }
`

export const SBellIcon = styled(BellIcon)`
  color: ${theme.colors.white};

  top: 8px;

  margin: 0 8px;

  :hover {
    color: ${theme.colors.brightBlue400};
    cursor: pointer;
  }
`
