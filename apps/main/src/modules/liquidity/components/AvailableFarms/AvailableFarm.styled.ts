import { css } from "@emotion/react"
import { Flex } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

const shouldForwardProp = (prop: string) => prop !== "isSelectable"

export const SYieldOpportunityContainer = styled(Flex, { shouldForwardProp })<{
  isSelectable?: boolean
}>(
  ({ theme, isSelectable }) => css`
    padding: ${theme.containers.paddings.primary}px;

    justify-content: space-between;
    gap: 10px;
    flex-grow: 1;

    ${isSelectable &&
    css`
      cursor: pointer;

      &:hover {
        background: ${theme.surfaces.containers.high.hover};
      }
    `};
  `,
)
