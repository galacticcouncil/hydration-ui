import { Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAssetListItem = styled(Flex)<{ isSelected: boolean }>(
  ({ theme, isSelected }) => css`
    justify-content: space-between;
    align-items: center;
    padding-inline: ${theme.space.m};
    gap: ${theme.space.base};
    width: 100%;
    height: 100%;
    border-bottom: 1px solid ${theme.details.separators};
    cursor: pointer;
    background: ${isSelected
      ? theme.buttons.secondary.accent.rest
      : "transparent"};
    &:hover {
      background: ${theme.details.separators};
    }
  `,
)
