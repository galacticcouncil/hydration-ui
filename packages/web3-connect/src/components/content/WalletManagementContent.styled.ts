import { keyframes } from "@emotion/react"
import {
  Box,
  Flex,
  Grid,
  ModalBody,
  ModalHeader,
  SearchInput,
} from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

type PanelProps = { showAccountPanel: boolean }

type MobileColumnProps = { mobileHidden: boolean }

const shouldForwardProp = (prop: string) => prop !== "showAccountPanel"

const shouldForwardColumnProp = (prop: string) =>
  prop !== "showAccountPanel" && prop !== "mobileHidden"

export const SSearchInput = styled(SearchInput)(
  ({ theme }) => css`
    width: calc(100% - ${theme.space.base});
    flex-shrink: 0;
  `,
)

export const SScrollAreaContent = styled(Flex)(
  ({ theme }) => css`
    min-width: 0;
    padding-right: ${theme.space.base};
    padding-bottom: calc(var(--source-footer-height, 0px) + ${theme.space.xs});
  `,
)

export const SWalletManagementShell = styled(Box)(
  () => css`
    width: 100%;
    max-width: 100%;
    max-height: 75dvh;

    display: flex;
    flex-direction: column;
    overflow: hidden;

    ${mq("max-xs")} {
      height: 100dvh;
      max-height: 100dvh;
    }
  `,
)

export const SModalHeader = styled(ModalHeader)(
  ({ theme }) => css`
    padding-bottom: ${theme.space.l};
    flex-shrink: 0;
  `,
)

export const SModalBody = styled(ModalBody)(
  ({ theme }) => css`
    padding: 0 ${theme.space.base} ${theme.space.base};
    border-top: 0;

    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    ${mq("md")} {
      padding: 0 ${theme.space.s} ${theme.space.m} ${theme.space.m};
    }
  `,
)

export const SLayoutGrid = styled(Grid, { shouldForwardProp })<PanelProps>(
  ({ theme, showAccountPanel }) => css`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.space.base};

    width: 100%;
    max-width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;

    ${mq("md")} {
      grid-template-columns: ${showAccountPanel
        ? `${pxToRem(200)} calc(100% - ${pxToRem(200)} - ${theme.space.s})`
        : "100% 0px"};
      gap: ${showAccountPanel ? theme.space.s : 0};
    }

    @media (prefers-reduced-motion: no-preference) {
      transition:
        grid-template-columns 320ms ${theme.easings.outExpo},
        gap 320ms ${theme.easings.outExpo};
    }
  `,
)

export const SSourceColumn = styled(Flex, {
  shouldForwardProp: shouldForwardColumnProp,
})<MobileColumnProps>(
  ({ theme, mobileHidden }) => css`
    flex-direction: column;
    gap: ${theme.space.base};

    min-width: 0;
    min-height: 0;
    max-height: none;
    overflow: hidden;
    padding-inline: 0;

    ${mq("max-sm")} {
      display: ${mobileHidden ? "none" : "flex"};
    }

    ${mq("md")} {
      max-height: 100%;
    }
  `,
)

const SOURCE_FOOTER_PAD = pxToRem(4)
const SOURCE_FOOTER_BUTTON_HEIGHT = pxToRem(40)

export const SSourceScrollFrame = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasFooter",
})<{ hasFooter?: boolean }>(
  ({ hasFooter }) => css`
    position: relative;

    flex: 1;
    min-height: 0;
    height: 100%;
    overflow: hidden;

    --source-footer-height: ${hasFooter
      ? `calc(${SOURCE_FOOTER_PAD} + ${SOURCE_FOOTER_BUTTON_HEIGHT})`
      : "0px"};
  `,
)

export const SSourceFooter = styled(Box)(
  ({ theme }) => css`
    position: absolute;
    left: 0;
    bottom: 0;
    right: ${theme.space.base};
    z-index: 2;

    display: flex;
    flex-direction: column;
    padding-top: ${SOURCE_FOOTER_PAD};

    background: ${theme.surfaces.themeBasePalette.surfaceHigh};
  `,
)

const revealUp = keyframes`
  from {
    opacity: 0;
    translate: 0 ${pxToRem(8)};
  }
`

export const SRightPanelFrame = styled(Box, {
  shouldForwardProp: shouldForwardColumnProp,
})<PanelProps & MobileColumnProps>(
  ({ theme, showAccountPanel, mobileHidden }) => css`
    min-width: 0;
    min-height: 0;
    max-height: ${showAccountPanel ? "none" : 0};
    overflow: hidden;

    opacity: ${showAccountPanel ? 1 : 0};
    visibility: ${showAccountPanel ? "visible" : "hidden"};
    pointer-events: ${showAccountPanel ? "auto" : "none"};
    transition: ${showAccountPanel
      ? "opacity 160ms ease-out 80ms"
      : "opacity 80ms ease-out, visibility 0s linear 80ms"};

    ${showAccountPanel &&
    css`
      @media (prefers-reduced-motion: no-preference) {
        & > :not([aria-live]) > *,
        & > [aria-live] > * > * {
          animation: ${revealUp} 360ms ${theme.easings.outExpo} both;
          animation-delay: 250ms;
        }

        ${[0, 1, 2, 3, 4].map(
          (i) => css`
            & > :not([aria-live]) > :nth-child(${i + 1}),
            & > [aria-live] > * > :nth-child(${i + 1}) {
              animation-delay: ${i * 50}ms;
            }
          `,
        )}
      }
    `}

    ${mq("max-sm")} {
      display: ${mobileHidden ? "none" : "flex"};
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    ${mq("md")} {
      display: flex;
      flex-direction: column;
      height: 100%;
      /* hidden panel must not size the grid row */
      max-height: ${showAccountPanel ? "100%" : 0};
    }
  `,
)

export const SRightColumn = styled(Flex)(
  ({ theme }) => css`
    flex-direction: column;
    gap: ${theme.space.base};

    min-width: 0;
    min-height: 0;
    flex: 1;
    max-height: none;
    overflow: hidden;

    ${mq("md")} {
      max-height: 100%;
    }
  `,
)
