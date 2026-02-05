import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-dialog"

import { Box } from "@/components/Box"
import {
  SModalBody,
  SModalHeader,
  SModalHeaderButton,
  SModalOverlay,
  SModalWrapper,
} from "@/components/Modal/Modal.styled"
import { Paper } from "@/components/Paper"
import { Text } from "@/components/Text"
import { mq } from "@/theme"

export const SSheetOverlay = SModalOverlay

export const SSheetClose = SModalHeaderButton

export const SSheetWrapper = styled(SModalWrapper)`
  inset: ${({ theme }) => theme.space.base};
  justify-items: end;
`

export const SSheetContent = styled(Content)(
  ({ theme }) => css`
    --modal-content-padding: ${theme.space.xl};

    position: fixed;
    inset: 0;

    width: 100%;

    & > div > :not([hidden]) ~ :not([hidden]) {
      border-top: 1px solid ${theme.details.borders};
    }

    &[data-state="open"] {
      animation: ${theme.animations.fadeInBottom} 0.3s;
      animation-timing-function: ${theme.easings.outExpo};
    }

    &[data-state="closed"] {
      animation: ${theme.animations.fadeOut} 0.1s;
    }

    ${mq("sm")} {
      inset: 8px;
      left: auto;
      max-width: ${theme.sizes["5xl"]};

      &[data-state="open"] {
        animation: ${theme.animations.fadeInRight} 0.2s;
      }
    }
  `,
)

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
  padding-block: ${({ theme }) => theme.space.l};
  padding-inline: var(--modal-content-padding);
`

export const SSheetTitleContainer = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: var(--modal-header-button-size);
`

export const SSheetBody = SModalBody

export const SSheetTitle = styled(Text)`
  color: ${({ theme }) => theme.text.high};
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSizes.h7};
  font-family: ${({ theme }) => theme.fontFamilies1.primary};
`
