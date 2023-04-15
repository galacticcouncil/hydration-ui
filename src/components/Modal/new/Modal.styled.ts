import styled from "@emotion/styled"
import { Content, Overlay } from "@radix-ui/react-dialog"
import { theme } from "theme"

export const SOverlay = styled(Overlay)`
  position: fixed;
  inset: 0;
  z-index: ${theme.zIndices.backdrop};

  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
`

export const SContent = styled(Content)`
  --modal-header-padding-y: 20px;
  --modal-header-padding-x: 24px;
  --modal-header-btn-size: 32px;
  --modal-header-height: calc(
    var(--modal-header-btn-size) + var(--modal-header-padding-y) * 2
  );

  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${theme.zIndices.modal};

  overflow: auto;

  width: 100%;
  max-width: min(600px, 95vw);
  max-height: 80%;

  padding-top: var(--modal-header-height);

  background: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.modal};
  border-radius: 4px;

  &:focus {
    outline: none;
  }
`
