import { Box } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SMultisigAccount = styled(Box)(({ theme }) => [
  css`
    display: flex;
    align-items: center;
    column-gap: ${theme.space.base};

    min-height: 0;
    overflow: hidden;

    padding: ${theme.space.l};
    padding-right: ${theme.space.base};
    transition: ${theme.transitions.colors};

    background: ${theme.surfaces.containers.dim.dimOnBg};
    border-radius: ${theme.radii.m};

    &[data-active="true"] {
      background-color: ${theme.buttons.secondary.accent.rest};
    }
  `,
])
