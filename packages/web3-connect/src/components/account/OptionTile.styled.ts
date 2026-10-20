import { Theme } from "@emotion/react"
import { Box } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

/** Shared look of the modal's clickable rows: wallet sources, accounts, external wallet recents/contacts. */
export const optionTile = (theme: Theme) => css`
  border: 1px solid transparent;
  border-radius: ${theme.radii.m};
  background: ${theme.surfaces.containers.dim.dimOnBg};
  color: ${theme.text.high};

  cursor: pointer;
  transition: ${theme.transitions.colors};

  &:hover {
    background-color: ${theme.controls.dim.active};
    border-color: ${theme.buttons.secondary.outline.outline};
  }

  &[data-active="true"] {
    background: ${theme.buttons.secondary.accent.rest};
    border-color: ${theme.buttons.secondary.accent.outline};

    &:hover {
      background: ${theme.controls.dim.active};
    }
  }
`

export const SOptionTile = styled(Box)(
  ({ theme }) => css`
    ${optionTile(theme)}

    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    gap: ${theme.space.base};

    padding: ${theme.space.base};
    overflow: hidden;

    &:focus-visible {
      outline: 2px solid ${theme.buttons.secondary.accent.outline};
      outline-offset: 2px;
    }
  `,
)
