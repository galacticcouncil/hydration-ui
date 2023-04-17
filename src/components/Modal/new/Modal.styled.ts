import { css } from "@emotion/react"
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

export const SContent = styled(Content)<{ isDrawer?: boolean }>`
  --modal-header-padding-y: 20px;
  --modal-header-padding-x: 24px;
  --modal-header-btn-size: 32px;
  --modal-header-height: calc(
    var(--modal-header-btn-size) + var(--modal-header-padding-y) * 2
  );

  position: fixed;
  inset: 0;
  z-index: ${theme.zIndices.modal};
  overflow: auto;

  padding-top: var(--modal-header-height);

  background: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.modal};
  border-radius: 4px;

  ${({ isDrawer }) =>
    isDrawer &&
    css`
      top: initial;
      max-height: 90%;
      border-radius: 20px 20px 0 0;
    `}

  &:focus {
    outline: none;
  }

  @media ${theme.viewport.gte.sm} {
    top: 10%;
    right: initial;
    bottom: initial;
    left: 50%;
    transform: translateX(-50%);

    width: 100%;
    max-width: min(600px, 95vw);
    max-height: 80%;

    border-radius: 4px;
  }
`
