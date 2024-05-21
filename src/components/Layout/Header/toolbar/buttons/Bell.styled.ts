import styled from "@emotion/styled"
import { theme } from "theme"
import ActiveReferendumIcon from "assets/icons/ActiveReferendumIcon.svg?react"
import PendingBridgeIcon from "assets/icons/ClockIcon.svg?react"
import { css } from "@emotion/react"

export const SActiveReferendumIcon = styled(ActiveReferendumIcon)`
  color: ${theme.colors.warningYellow400};
  border-radius: 50%;
  position: absolute;
  right: 6px;
  top: 6px;
  width: 12px;
  height: 12px;
`

export const SPendingBridgeIcon = styled(PendingBridgeIcon)`
  color: ${theme.colors.green500};
  border-radius: 50%;
  position: absolute;
  right: 6px;
  top: 6px;
  width: 12px;
  height: 12px;
`

export const SMaskContainer = styled.div<{ cropped: boolean }>`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ cropped }) =>
    cropped &&
    css`
      -webkit-mask: radial-gradient(
        72% 72% at 70% 30%,
        transparent 25%,
        white 25%
      );
      mask: radial-gradient(72% 72% at 70% 30%, transparent 25%, white 25%);
    `}
`
