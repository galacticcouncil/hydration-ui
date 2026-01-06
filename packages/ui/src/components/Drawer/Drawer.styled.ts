import { Content, Overlay } from "vaul"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { styled } from "@/utils"

export const SDrawerOverlay = styled(Overlay)`
  position: fixed;
  inset: 0;

  display: grid;
  place-items: center;

  z-index: ${({ theme }) => theme.zIndices.modal};

  background: ${({ theme }) => theme.details.overlays};
`

export const SDrawerContent = styled(Content)`
  --modal-content-padding: 12px;
  --modal-content-inset: calc(-1 * var(--modal-content-padding));
  --modal-block-offset: 30px;

  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  outline: none;

  max-height: calc(100dvh - var(--modal-block-offset));

  background: ${({ theme }) => theme.surfaces.themeBasePalette.surfaceHigh};

  border-top-left-radius: ${({ theme }) =>
    theme.containers.cornerRadius.containersPrimary}px;
  border-top-right-radius: ${({ theme }) =>
    theme.containers.cornerRadius.containersPrimary}px;

  border: 1px solid ${({ theme }) => theme.details.borders};

  display: flex;
  flex-direction: column;

  width: 100%;
  height: auto;

  z-index: ${({ theme }) => theme.zIndices.modal};
`

export const SDrawerHeader = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: var(--modal-content-padding);
  padding-top: 0;

  border-bottom: 1px solid ${({ theme }) => theme.details.borders};
`

export const SDrawerBody = styled(Box)`
  padding: var(--modal-content-padding);

  flex: 1;
`

export const SDrawerHandle = styled(Box)`
  width: 70px;
  height: 4px;
  border-radius: 4px;
  flex-shrink: 0;

  margin: var(--modal-content-padding) auto;

  background: ${({ theme }) => theme.controls.outline.base};
`

export const SDrawerFooter = styled(Flex)`
  flex-direction: column-reverse;
  gap: 10px;

  padding: var(--modal-content-padding);
`

export const SDrawerTitle = styled(Text)`
  width: 100%;

  color: ${({ theme }) => theme.text.high};
  text-align: center;

  font-weight: 500;
  font-size: ${({ theme }) => theme.headlineSize.h7};
  font-family: ${({ theme }) => theme.fontFamilies1.primary};
`

export const SDrawerDescription = styled(Text)`
  width: 100%;

  color: ${({ theme }) => theme.text.medium};
  text-align: center;

  font-size: ${({ theme }) => theme.paragraphSize.p5};
`
