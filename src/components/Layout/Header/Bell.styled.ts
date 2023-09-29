import styled from "@emotion/styled"
import { theme } from "theme"
import BellIcon from "assets/icons/BellIcon.svg?react"
import ActiveReferendumIcon from "assets/icons/ActiveReferendumIcon.svg?react"
import { css } from "@emotion/react"

export const SActiveReferendumIcon = styled(ActiveReferendumIcon)`
  color: ${theme.colors.warningYellow400};
  border-radius: 50%;
  position: absolute;
  right: 4px;
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

  transition: ${theme.transitions.slow};

  border-radius: 50%;

  width: 36px;
  height: 36px;

  position: relative;

  &:hover {
    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    & > div > div > svg {
      color: ${theme.colors.white};
    }
  }
`

export const MaskContainer = styled.div<{ cropped: boolean }>`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: hidden;

  ${({ cropped }) =>
    cropped &&
    css`
      -webkit-mask: radial-gradient(
        90% 90% at 72% 33%,
        transparent 25%,
        white 25%
      );
      mask: radial-gradient(90% 90% at 72% 33%, transparent 25%, white 25%);
    `}
`
