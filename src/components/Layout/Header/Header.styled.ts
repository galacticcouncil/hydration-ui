import styled from "@emotion/styled"
import { theme } from "theme"
import { ReactComponent as BellIcon } from "assets/icons/BellIcon.svg"

export const SHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.header};

  width: calc(100% - 1px);

  padding: 6px 12px;

  backdrop-filter: blur(16px);
  background: rgba(${theme.rgbColors.black}, 0.2);

  @media ${theme.viewport.gte.sm} {
    padding: 8px 40px 8px 40px;
  }

  @media ${theme.viewport.gte.md} {
    padding: 8px 40px 8px 0;
  }
`

export const SBellIcon = styled(BellIcon)`
  color: #d9d9d9;

  top: 8px;

  margin: 0 8px;

  :hover {
    color: ${theme.colors.brightBlue400};
    cursor: pointer;
  }
`
