import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-dialog"

import {
  SModalBody,
  SModalClose,
  SModalHeader,
  SModalOverlay,
  SModalWrapper,
} from "@/components/Modal/Modal.styled"
import { Paper } from "@/components/Paper"
import { Text } from "@/components/Text"
import { mq } from "@/theme"

export const SSheetOverlay = SModalOverlay

export const SSheetClose = styled(SModalClose)`
  padding: 18px 20px;
`

export const SSheetWrapper = styled(SModalWrapper)`
  inset: 8px;
  justify-items: end;
`

export const SSheetContent = styled(Content)`
  --modal-content-padding: 20px;

  position: fixed;
  inset: 0;

  width: 100%;

  & > div > :not([hidden]) ~ :not([hidden]) {
    border-top: 1px solid ${({ theme }) => theme.details.borders};
  }

  &[data-state="open"] {
    animation: ${({ theme }) => theme.animations.fadeInBottom} 0.3s;
    animation-timing-function: ${({ theme }) => theme.easings.outExpo};
  }

  &[data-state="closed"] {
    animation: ${({ theme }) => theme.animations.fadeOut} 0.1s;
  }

  ${mq("sm")} {
    inset: 8px;
    left: auto;
    max-width: 400px;

    &[data-state="open"] {
      animation: ${({ theme }) => theme.animations.fadeInRight} 0.2s;
    }
  }
`

export const SSheetPaper = styled(Paper)`
  display: flex;
  flex-direction: column;

  padding-bottom: env(safe-area-inset-bottom);

  height: 100%;

  ${mq("max-xs")} {
    border: 0;
    border-radius: 0;
  }
`

export const SSheetHeader = styled(SModalHeader)`
  padding: 15px var(--modal-content-padding);
`

export const SSheetBody = SModalBody

export const SSheetTitle = styled(Text)`
  color: ${({ theme }) => theme.text.high};
  font-weight: 500;
  font-size: ${({ theme }) => theme.headlineSize.h7};
  font-family: ${({ theme }) => theme.fontFamilies1.primary};
`
