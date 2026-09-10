import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityLegend = styled(Flex)(
  ({ theme }) => css`
    column-gap: ${theme.space.xl};
    row-gap: ${theme.space.s};
  `,
)

export const SManagedBand = styled(Flex, {
  shouldForwardProp: (prop) => prop !== "$edgeColor" && prop !== "$bandOpacity",
})<{
  $edgeColor: string
  $bandOpacity: number
}>(
  ({ $edgeColor, $bandOpacity }) => css`
    z-index: 1;
    border: 1px solid color-mix(in srgb, ${$edgeColor} 28%, transparent);
    opacity: ${$bandOpacity};
    pointer-events: none;
    transition:
      left 650ms ease-in-out,
      width 650ms ease-in-out,
      opacity 650ms ease-in-out;
  `,
)

export const SSpotLine = styled(Flex)(css`
  z-index: 2;
  pointer-events: none;
  transition: left 650ms ease-in-out;
`)
