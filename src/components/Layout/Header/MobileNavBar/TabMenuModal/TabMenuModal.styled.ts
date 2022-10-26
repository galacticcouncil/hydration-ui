import styled from "@emotion/styled"
import { DialogContent } from "@radix-ui/react-dialog"
import { theme } from "theme"

export const SModalContent = styled(DialogContent)`
  position: absolute;
  right: 0;
  bottom: 0;
  overflow: hidden;

  width: 70%;

  margin: 0 5px 10px 0;

  border: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  border-radius: 20px;

  :focus-visible {
    outline: none;
  }
`

export const SBackdrop = styled.div`
  width: 100%;
  height: 100vh;

  position: fixed;
  bottom: 54px;
  left: 0;

  background: rgba(7, 8, 14, 0.7);
`
