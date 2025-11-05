import styled from "@emotion/styled"
import { Content, Overlay } from "@radix-ui/react-dialog"

import { Box } from "@/components/Box"
import { ButtonIcon } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"
import { Separator } from "@/components/Separator"
import { Text } from "@/components/Text"
import { mq } from "@/theme"

export const SModalOverlay = styled(Overlay)`
  position: fixed;
  inset: 0;

  display: grid;
  place-items: center;

  z-index: ${({ theme }) => theme.zIndices.modal};

  background: ${({ theme }) => theme.details.overlays};

  &[data-state="open"] {
    animation: ${({ theme }) => theme.animations.fadeIn} 0.2s;
  }

  &[data-state="closed"] {
    animation: ${({ theme }) => theme.animations.fadeOut} 0.2s;
  }
`

export const SModalClose = styled(ButtonIcon)`
  padding: 4px;
  flex-grow: 0;

  cursor: pointer;
`

export const SModalWrapper = styled(Overlay)`
  --modal-block-offset: 10vh;

  position: fixed;
  inset: 0;
  padding-block: var(--modal-block-offset);

  display: grid;
  gap: 4px;
  justify-items: center;

  overflow-y: auto;

  z-index: ${({ theme }) => theme.zIndices.modal};

  &[data-state="closed"] {
    animation: ${({ theme }) => theme.animations.fadeOut} 0.2s;
  }
`

export const SModalContent = styled(Content)`
  --modal-content-padding: 20px;
  --modal-content-inset: calc(var(--modal-content-padding) * -1);

  position: fixed;
  inset: 0;
  outline: none;

  width: 100%;
  height: 100dvh;

  & > div > :not([hidden]) ~ :not([hidden]) {
    border-top: 1px solid ${({ theme }) => theme.details.separators};
  }

  &[data-state="open"] {
    animation: ${({ theme }) => theme.animations.fadeInBottom} 0.2s;
    animation-timing-function: ${({ theme }) => theme.easings.outExpo};
  }

  &[data-state="closed"] {
    animation: ${({ theme }) => theme.animations.fadeOutBottom} 0.2s;
  }

  ${mq("sm")} {
    position: relative;
    inset: auto;

    max-width: 520px;
    height: auto;

    &[data-state="open"] {
      animation: ${({ theme }) => theme.animations.scaleInTop} 0.2s;
    }

    &[data-state="closed"] {
      animation: ${({ theme }) => theme.animations.scaleOutTop} 0.2s;
    }
  }
`

export const SModalPaper = styled(Paper)`
  display: flex;
  flex-direction: column;

  max-width: 520px;
  padding-bottom: env(safe-area-inset-bottom);

  ${mq("max-xs")} {
    height: 100%;
    border: 0;
    border-radius: 0;
  }
`

export const SModalHeader = styled(Flex)`
  flex-direction: column;

  padding: var(--modal-content-padding);

  & > div:first-of-type {
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    & > :not(button) {
      flex-grow: 1;
    }
  }
`

export const SModalBody = styled(Box)<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) =>
    noPadding ? 0 : "var(--modal-content-padding)"};

  flex: 1;

  &:last-of-type {
    border-bottom-right-radius: ${({ theme }) => theme.radii.xl}px;
    border-bottom-left-radius: ${({ theme }) => theme.radii.xl}px;
  }
`

export const SModalFooter = styled(Flex)`
  flex-direction: column-reverse;
  gap: 10px;

  padding: 20px;

  &:last-of-type {
    border-bottom-right-radius: ${({ theme }) => theme.radii.xl}px;
    border-bottom-left-radius: ${({ theme }) => theme.radii.xl}px;
  }

  ${mq("md")} {
    flex-direction: row;
  }
`

export const SModalTitle = styled(Text)`
  color: ${({ theme }) => theme.text.high};
  font-weight: 500;
  font-size: ${({ theme }) => theme.headlineSize.h7};
  font-family: ${({ theme }) => theme.fontFamilies1.primary};
`

export const SModalDescription = styled(Text)`
  color: ${({ theme }) => theme.text.medium};
  font-size: ${({ theme }) => theme.paragraphSize.p5};
`

export const SModalContentDivider = styled(Separator)`
  margin-inline: var(--modal-content-inset);
`
