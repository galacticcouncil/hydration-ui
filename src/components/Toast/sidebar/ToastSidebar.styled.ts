import { DialogContent } from "@radix-ui/react-dialog"
import { theme } from "theme"
import { IconButton } from "components/IconButton/IconButton"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as NoActivities } from "assets/icons/NoActivities.svg"

const slideKeyframe = keyframes`
  0% {
    opacity: 0;
    transform: translateX(100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
`

export const SWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${theme.zIndices.backdrop};
`

export const SDialogContent = styled(DialogContent)`
  position: absolute;
  z-index: ${theme.zIndices.modal};

  display: flex;
  flex-direction: column;

  top: unset;
  left: 0;
  right: 0;
  bottom: 0;

  width: 100%;
  max-height: 80vh;

  background: ${theme.colors.basic900};
  box-shadow: 0px 0px 60px rgba(${theme.rgbColors.black}, 0.36);

  border-radius: 4px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;

  border: 1px solid rgba(${theme.rgbColors.white}, 0.06);

  @media ${theme.viewport.gte.sm} {
    left: unset;
    right: 8px;
    top: 8px;
    bottom: 8px;

    width: calc(100% - 16px);
    max-width: 400px;
    max-height: unset;

    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;

    padding-bottom: 12px;

    animation: 300ms cubic-bezier(0.16, 1, 0.3, 1) ${slideKeyframe};
  }
`

export const SSidebarBody = styled.div`
  height: 100%;
  overflow-y: auto;
`

export const SCloseButton = styled(IconButton)`
  position: absolute;
  top: 8px;
  right: 8px;

  color: ${theme.colors.white};
`

export const SGroupHeader = styled(Text)`
  padding: 10px 22px;

  font-size: 14px;
  font-weight: 400;
  color: ${theme.colors.basic400};

  background-color: rgba(${theme.rgbColors.primaryA06}, 0.06);
`

export const SNoActivitiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 96px 0;

  color: ${theme.colors.basic500};
`

export const SNoActivitiesIcon = styled(NoActivities)`
  width: 100%;
  height: 50px;
`
