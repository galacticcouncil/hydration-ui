import { css } from "@emotion/react"
import { Grid } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SContainer = styled(Grid)<{ isSelectable?: boolean }>(
  ({ theme, isSelectable }) => css`
    min-width: 250px;
    padding: ${isSelectable ? theme.containers.paddings.primary : 0}px;

    column-gap: 30px;
    row-gap: 10px;

    flex: 1;

    ${isSelectable &&
    css`
      cursor: pointer;

      &:hover {
        background: ${theme.surfaces.containers.high.hover};
      }
    `}

    & > [role="separator"] {
      margin: 0 -${theme.containers.paddings.primary}px;
      grid-column: 1 / span 2;
    }
  `,
)
