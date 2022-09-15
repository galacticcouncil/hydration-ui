import { DialogContent } from "@radix-ui/react-dialog"
import { SizeProps } from "utils/styles"
import { IconButton } from "components/IconButton/IconButton"
import { GradientText } from "components/Typography/GradientText/GradientText"
import styled, { keyframes } from "styled-components"
import { theme } from "theme"

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

export const ModalWindow = styled(DialogContent)<Pick<SizeProps, "width">>`
  background: ${theme.colors.backgroundGray900};
  height: 100vh;
  border: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  box-shadow: 0px 35px 71px -47px rgba(${theme.rgbColors.primary300}, 0.37);
  width: 100%;
  z-index: ${theme.zIndices.modal};
  position: absolute;
  top: 0;

  ${theme.mq.smallTablet} {
    max-width: ${(props) => `${props.width ?? 610}px`};
    height: auto;
    border-radius: 16px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};
`

export const ModalTitle = styled(GradientText)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
`
export const ModalBody = styled.div`
  padding: 0 30px 30px;
`
export const IconsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  gap: 8px;

  ${theme.mq.smallTablet} {
    justify-content: space-between;
  } ;
`
export const CloseButton = styled(IconButton)`
  ${theme.mq.smallTablet} {
    margin-left: auto;
  } ;
`
