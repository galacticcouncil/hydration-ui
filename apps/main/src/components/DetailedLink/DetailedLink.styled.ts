import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"

export const SDetailedLink = styled(Box)(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.base};

    width: 20rem;

    padding: ${theme.space.l};
    border-radius: ${theme.radii.m};

    text-decoration: none;

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
      svg {
        color: ${theme.icons.primary};
      }
    }
  `,
)
