import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAssetListItem = styled(Flex, {
  shouldForwardProp: (prop: string) => prop !== "isSelected",
})<{
  isSelected: boolean
}>(
  ({ theme, isSelected }) => css`
    justify-content: space-between;
    align-items: center;
    padding-inline: ${theme.space.m};
    gap: ${theme.space.base};
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: ${theme.radii.m};
    cursor: pointer;
    background: ${isSelected
      ? theme.buttons.secondary.accent.rest
      : "transparent"};
    &:hover {
      background: ${theme.details.separators};
    }

    // Drawn apart from the row so the rounded background doesn't bend it,
    // and only recolored when hidden so nothing shifts
    &::after {
      content: "";
      position: absolute;
      inset-inline: 0;
      bottom: 0;
      height: 1px;
      background: ${theme.details.separators};
    }

    // A hovered or selected row hides the separators on both of its sides.
    // CSS rather than hover state, so hovering doesn't re-render the list.
    &:hover::after,
    &[data-selected]::after,
    [data-virtual-index]:has(
        + [data-virtual-index] :is(:hover, [data-selected])
      )
      &::after {
      background: transparent;
    }
  `,
)
