import { DialogContent } from "@radix-ui/react-dialog"
import { theme } from "theme"
import { IconButton } from "components/IconButton/IconButton"
import styled from "@emotion/styled"

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

  right: 8px;
  top: 8px;
  bottom: 8px;

  width: 100%;
  max-width: 400px;

  background: ${theme.colors.backgroundGray900};
  border-radius: 16px;
  box-shadow: 0px 0px 60px rgba(0, 0, 0, 0.36);

  overflow-y: auto;
`
export const SCloseButton = styled(IconButton)`
  color: ${theme.colors.white};

  position: absolute;
  top: 4px;
  right: 4px;
`
