import { Box, Button, Flex, Image } from "@galacticcouncil/ui/components"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

const roundMark = (size: number) =>
  styled(Image)(
    ({ theme }) => css`
      width: ${pxToRem(size)};
      height: ${pxToRem(size)};
      border-radius: ${theme.radii.full};
      flex-shrink: 0;
      object-fit: contain;
    `,
  )

export const SSectionLogo = roundMark(16)

export const SAccountModeIcon = roundMark(12)

export const SAccountTile = styled(Box)(
  ({ theme }) => css`
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    gap: ${theme.space.base};

    padding: ${theme.space.base};

    border: 1px solid transparent;
    border-radius: ${theme.radii.m};
    background: ${theme.surfaces.containers.dim.dimOnBg};
    color: ${theme.text.high};

    cursor: pointer;
    overflow: hidden;
    transition: ${theme.transitions.colors};

    &:hover {
      background: ${theme.details.borders};
      border-color: ${theme.buttons.secondary.outline.outline};
    }

    &:focus-visible {
      outline: 2px solid ${theme.buttons.secondary.accent.outline};
      outline-offset: 2px;
    }

    &[data-active="true"] {
      background: ${theme.buttons.secondary.outline.fill};
      border-color: ${theme.buttons.secondary.outline.outline};
    }

    &[data-has-change-account="true"] {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  `,
)

export const SAccountTileCopyButton = styled(Box)(
  ({ theme }) => css`
    color: ${theme.text.medium};
    cursor: pointer;
    flex-shrink: 0;

    margin-left: auto;

    &[data-copied="true"] {
      color: ${theme.accents.success.emphasis};
    }

    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }
  `,
)

export const SSectionLabel = styled(Flex)(
  ({ theme }) => css`
    position: sticky;
    top: 0;
    z-index: 1;

    align-items: center;
    width: 100%;
    min-width: 0;

    background: ${theme.surfaces.themeBasePalette.surfaceHigh};
    padding-bottom: ${theme.space.s};
  `,
)

export const SChangeAccountButton = styled(Button)<{ isActive?: boolean }>(
  ({ theme, isActive }) => css`
    width: 100%;
    text-transform: uppercase;
    border: 1px solid transparent;
    border-top-color: ${theme.details.borders};
    border-radius: ${theme.radii.m};
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    ${isActive &&
    css`
      background-color: ${theme.buttons.secondary.outline.fill};
      border-color: ${theme.buttons.secondary.outline.outline};
      border-top-color: transparent;
    `}
  `,
)
