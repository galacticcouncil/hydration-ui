import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"

export const SDetailedLink = styled(Box)(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 10px;

    width: 320px;

    padding: 16px;
    border-radius: ${theme.radii.xl}px;

    text-decoration: none;

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
    }
  `,
)
