import { Button, Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

import { OptionTile } from "@/components/account/OptionTile"

export const SAccountTile = styled(OptionTile)`
  &[data-has-change-account="true"] {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`

export const SAccountTileCopyButton = styled(Button)(
  ({ theme }) => css`
    flex-shrink: 0;
    margin-left: auto;

    background-color: transparent;

    &[data-copied="true"] {
      color: ${theme.accents.success.emphasis} !important;
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
    margin-bottom: ${theme.space.xs};
    padding-bottom: ${theme.space.s};
  `,
)

/* mirrors `optionTile`, so the button reads as part of the account tile above it */
export const SChangeAccountButton = styled(Button)<{ isActive?: boolean }>(
  ({ theme, isActive }) => css`
    --button-bg: ${theme.surfaces.containers.dim.dimOnBg};

    width: 100%;
    text-transform: uppercase;
    border: 1px solid transparent;
    border-top-color: ${theme.details.borders};
    border-radius: ${theme.radii.m};
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    &:hover {
      background-color: ${theme.controls.dim.active};
      border-color: ${theme.buttons.secondary.outline.outline};
      border-top-color: ${theme.details.borders};
    }

    ${isActive &&
    css`
      --button-bg: ${theme.buttons.secondary.accent.rest};
      border-color: ${theme.buttons.secondary.accent.outline};
      border-top-color: transparent;

      &:hover {
        border-color: ${theme.buttons.secondary.accent.outline};
        border-top-color: transparent;
      }
    `}
  `,
)
