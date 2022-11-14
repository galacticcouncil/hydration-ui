import styled from "@emotion/styled"
import { DialogContent } from "@radix-ui/react-dialog"
import { IconButton } from "components/IconButton/IconButton"
import { theme } from "theme"

export const SModalContent = styled(DialogContent)`
  position: absolute;
  right: 0;
  bottom: 0;

  width: 70%;

  margin: 20px 17px 1px 0;
  padding-top: 20px;
  outline: 1px solid rgba(48, 52, 76, 0.5);

  border-radius: 4px;

  box-shadow: 1px -3px 100px rgba(68, 104, 199, 0.3);

  background: ${theme.colors.darkBlue700};

  :focus-visible {
    outline: none;
  }
`

export const SBackdrop = styled.div`
  width: 100%;
  height: 100vh;

  position: fixed;
  bottom: 60px;
  left: 0;

  background: rgba(0, 7, 50, 0.7);
`

export const CloseButton = styled(IconButton)`
  color: ${theme.colors.white};
  background: ${theme.colors.darkBlue700};

  position: absolute;
  top: -10px;
  right: -10px;

  :focus-visible {
    outline: none;
  }
`
