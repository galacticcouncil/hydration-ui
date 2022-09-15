import styled from "styled-components"
import { theme } from "theme"

export const SBackdrop = styled.div`
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndices.backdrop};
  background: rgba(${theme.rgbColors.black}, 0.2);
  backdrop-filter: blur(7px);
`
