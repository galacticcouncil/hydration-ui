import { css } from "@emotion/react"
import { Grid } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { styled } from "@galacticcouncil/ui/utils"

const shouldForwardProp = (prop: string) => prop !== "isSelectable"

export const SContainer = styled(Grid, { shouldForwardProp })<{
  isSelectable?: boolean
}>(
  ({ theme, isSelectable }) => css`
    min-width: 350px;
    padding: ${isSelectable ? theme.containers.paddings.primary : 0}px;

    column-gap: 10px;
    row-gap: 10px;
    align-items: center;
    grid-template-columns: minmax(200px, auto) minmax(90px, 1fr);

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

    ${mq("lg")} {
      column-gap: 30px;
    }
  `,
)
