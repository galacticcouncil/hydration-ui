import styled from "@emotion/styled"
import { theme } from "theme"
import { ReactComponent as BellIcon } from "assets/icons/BellIcon.svg"
import { ReactComponent as ActiveReferendumIcon } from "assets/icons/ActiveReferendumIcon.svg"

export const SActiveReferendumIcon = styled(ActiveReferendumIcon)`
  color: #1469a5;
  background: ${theme.colors.warningYellow400};
  border-radius: 50%;
  position: absolute;
  right: 6px;
  top: 6px;
  width: 12px;
  height: 12px;
`

export const SBellIcon = styled(BellIcon)`
  color: ${theme.colors.brightBlue100};

  width: 35px;
  height: 35px;

  padding: 6px;

  border-radius: 50%;

  top: 3px;
  left: 2px;
`

export const SWrap = styled.div`
  cursor: pointer;

  ${SBellIcon} {
    transition: ${theme.transitions.slow};
  }

  :hover > ${SBellIcon} {
    color: ${theme.colors.white};
    background: rgba(${theme.rgbColors.alpha0}, 0.06);
    transform: rotate(30deg);
  }
`
