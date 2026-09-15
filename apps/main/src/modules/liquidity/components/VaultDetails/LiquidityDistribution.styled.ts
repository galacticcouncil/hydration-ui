import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SLiquidityLegend = styled(Flex)(
  ({ theme }) => css`
    column-gap: ${theme.space.xl};
    row-gap: ${theme.space.s};
  `,
)

export const SManagedBand = styled(Flex, {
  shouldForwardProp: (prop) =>
    prop !== "$rangeColor" &&
    prop !== "$fillOpacity" &&
    prop !== "$borderOpacity",
})<{
  $rangeColor: string
  $fillOpacity: number
  $borderOpacity: number
}>(
  ({ $rangeColor, $fillOpacity, $borderOpacity }) => css`
    z-index: 1;
    background: color-mix(
      in srgb,
      ${$rangeColor} ${$fillOpacity * 100}%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, ${$rangeColor} ${$borderOpacity * 100}%, transparent);
    pointer-events: none;
    transition:
      left 650ms ease-in-out,
      width 650ms ease-in-out,
      background 650ms ease-in-out,
      border-color 650ms ease-in-out;
  `,
)

export const SSpotLine = styled(Flex)(css`
  z-index: 2;
  pointer-events: none;
  transition: left 650ms ease-in-out;
`)
