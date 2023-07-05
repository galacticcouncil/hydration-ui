import styled from "@emotion/styled"
import { theme } from "theme"
import { ReactComponent as BellIcon } from "assets/icons/BellIcon.svg"
import { ReactComponent as Questionmark } from "assets/icons/Questionmark.svg"

export const SHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.header};

  width: calc(100% - 0px);

  padding: 6px 12px;

  backdrop-filter: blur(16px);
  background: rgba(9, 9, 9, 0.11);

  @media ${theme.viewport.gte.sm} {
    padding: 8px 40px 8px 40px;
  }

  @media ${theme.viewport.gte.md} {
    padding: 8px 40px 8px 0;
  }
`

export const SBellIcon = styled(BellIcon)`
  color: ${theme.colors.brightBlue100};

  width: 35px;
  height: 35px;

  padding: 6px;

  border-radius: 50%;

  top: 3px;
  left: 2px;

  transition: ${theme.transitions.slow};

  :hover {
    color: ${theme.colors.white};
    cursor: pointer;

    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    transform: rotate(30deg);
  }
`

export const SQuestionmark = styled(Questionmark)`
  color: ${theme.colors.brightBlue100};

  top: 8px;

  padding: 9px;

  width: 35px;
  height: 35px;

  border-radius: 50%;

  transition: ${theme.transitions.slow};

  :hover {
    color: ${theme.colors.white};
    cursor: pointer;

    background: rgba(${theme.rgbColors.alpha0}, 0.06);
  }
`
