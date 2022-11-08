import { Viewport } from "@radix-ui/react-toast"
import styled from "@emotion/styled"
import { theme } from "theme"

export const ToastViewport = styled(Viewport)`
  position: absolute;
  bottom: 0;
  right: 0;
  overflow: hidden;
  z-index: ${theme.zIndices.toast};

  margin: 0;
  padding: 16px;

  list-style: none;
`
