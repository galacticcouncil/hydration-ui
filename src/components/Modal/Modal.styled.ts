import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { Content, Overlay } from "@radix-ui/react-dialog"
import { BackdropVariant } from "components/Backdrop/Backdrop"
import { backdropVariantStyles } from "components/Backdrop/Backdrop.styled"
import { theme } from "theme"

const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
`

const mobFadeInKeyframes = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`

const drawerKeyFrames = keyframes`
  0% {
    transform: translateY(50%);
  }

  100% {
    transform: translateY(0) ;
  }
`

export const SOverlay = styled(Overlay)<{ variant?: BackdropVariant }>`
  position: fixed;
  inset: 0;
  z-index: ${theme.zIndices.backdrop};

  backdrop-filter: blur(16px);
  ${({ variant }) => variant && backdropVariantStyles[variant]}
`

export const SContainer = styled(Content)`
  --modal-header-padding-y: 20px;
  --modal-header-padding-x: 24px;
  --modal-header-btn-size: 32px;
  --modal-header-height: calc(
    var(--modal-header-btn-size) + var(--modal-header-padding-y) * 2
  );
  --modal-content-padding: 24px;
  --modal-top-content-height: 64px;

  position: fixed;
  inset: 0;
  z-index: ${theme.zIndices.modal};
`

export const STopContent = styled.div`
  position: absolute;
  top: calc(var(--modal-top-content-height) / 2);
  left: 0;
  right: 0;
  transform: translateY(-50%);
  z-index: ${theme.zIndices.modal};

  width: 100%;
  height: var(--modal-top-content-height);

  display: flex;
  align-items: center;
  justify-content: center;

  @media ${theme.viewport.gte.sm} {
    top: 5%;
  }
`

export const SContent = styled.div<{
  isDrawer?: boolean
  hasTopContent?: boolean
}>`
  position: fixed;
  inset: 0;
  ${({ hasTopContent }) =>
    hasTopContent && "top: var(--modal-top-content-height);"}
  z-index: ${theme.zIndices.modal};

  display: flex;

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

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1)
    ${({ isDrawer }) => (isDrawer ? drawerKeyFrames : mobFadeInKeyframes)};

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

    animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};

    &::before {
      content: "";
      position: absolute;
      inset: 0;

      border-radius: 4px;
      padding: 1px; // a width of the border

      background: linear-gradient(
        180deg,
        rgba(102, 151, 227, 0.35) 0%,
        rgba(68, 109, 174, 0.3) 66.67%,
        rgba(91, 151, 245, 0) 99.99%,
        rgba(158, 167, 180, 0) 100%
      );

      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask: linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
  }
`
