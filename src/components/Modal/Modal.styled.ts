import { DialogContent } from "@radix-ui/react-dialog"
import { IconButton } from "components/IconButton/IconButton"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { theme } from "theme"
import isPropValid from "@emotion/is-prop-valid"
import { GradientText } from "components/Typography/GradientText/GradientText"

const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
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

export const ModalContainer = styled.div`
  --mobile-modal-header-height: 60px;
  --modal-header-title-height: 32px;

  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${theme.zIndices.backdrop};
`

export const ModalWindow = styled(DialogContent, {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== "maxWidth" && prop !== "isDrawer",
})<{
  maxWidth?: number
  isDrawer?: boolean
}>`
  position: absolute;
  z-index: ${theme.zIndices.modal};
  width: 100%;

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1)
    ${({ isDrawer }) => (isDrawer ? drawerKeyFrames : mobFadeInKeyframes)};

  ${({ isDrawer }) =>
    isDrawer
      ? { bottom: 0, borderRadius: "20px 20px 0px 0px" }
      : { top: 0, height: "100%" }}

  @media ${theme.viewport.gte.sm} {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    height: auto;
    max-width: ${(props) => `${props.maxWidth ?? 610}px`};

    border-radius: 4px;

    animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};
  }
`

export const ModalWindowContainer = styled.div<{ isDrawer?: boolean }>`
  display: flex;
  flex-direction: column;

  height: 100%;

  background: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.modal};

  ${({ isDrawer }) => (isDrawer ? { borderRadius: "20px 20px 0px 0px" } : {})}

  @media ${theme.viewport.gte.sm} {
    :before {
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

      -webkit-mask: linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    border-radius: 4px;
  }
`

export const ModalTitle = styled(GradientText)`
  width: fit-content;

  font-size: 24px;
  line-height: var(--modal-header-title-height);
  font-weight: 500;
  font-family: "FontOver", sans-serif;
  background: ${theme.gradients.pinkLightBlue};
  -webkit-background-clip: text;
`

export const ModalBody = styled.div<{ isDrawer?: boolean }>`
  display: flex;
  flex-direction: column;

  --modal-body-padding-x: 20px;

  padding: 0 var(--modal-body-padding-x) 36px;
  overflow-y: auto;

  ${({ isDrawer }) =>
    isDrawer
      ? "max-height: calc(100vh - var(--mobile-modal-header-height));"
      : "height: calc(100vh - var(--mobile-modal-header-height));"}

  @media ${theme.viewport.gte.sm} {
    --modal-body-padding-x: 30px;
    padding-bottom: 30px;
    max-height: 80vh;
    height: auto;
  }

  &::-webkit-scrollbar-track {
    margin-bottom: 16px;
  }
`
export const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 8px;
  gap: 8px;
  min-height: var(--mobile-modal-header-height);

  @media ${theme.viewport.gte.sm} {
    min-height: fit-content;
    padding: 13px;
    justify-content: space-between;
  }
`
export const CloseButton = styled(IconButton)`
  color: ${theme.colors.white};
  position: absolute;
  top: 0;
  right: 0;
  margin: 13px 19px;
  @media ${theme.viewport.gte.sm} {
    position: relative;
    margin: 0px;
    margin-left: auto;
  }
`

export const SecondaryButton = styled(IconButton)`
  color: ${theme.colors.white};
  position: absolute;
  top: 0;
  left: 0;
  margin: 13px 19px;
  @media ${theme.viewport.gte.sm} {
    position: relative;
    margin: 0px;
    margin-right: auto;
  }
`
