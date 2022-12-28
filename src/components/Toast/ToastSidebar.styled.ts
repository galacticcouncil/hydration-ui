import { DialogContent } from "@radix-ui/react-dialog"
import { theme } from "theme"
import { IconButton } from "components/IconButton/IconButton"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

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

    animation: 300ms cubic-bezier(0.16, 1, 0.3, 1) ${slideKeyframe};

    width: calc(100% - 16px);
    max-width: 400px;
    max-height: unset;

    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;

    padding-bottom: 12px;
  }
`
export const SidebarBody = styled.div`
  overflow-y: auto;

  height: 100%;
`

export const SCloseButton = styled(IconButton)`
  color: ${theme.colors.white};

  position: absolute;
  top: 8px;
  right: 8px;
`
