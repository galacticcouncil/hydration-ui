import { DropdownMenuTrigger } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const CopyMenuTrigger = styled(DropdownMenuTrigger)(
  ({ theme }) => css`
    position: absolute;

    cursor: pointer;

    font-size: ${theme.fontSizes.p4};
    font-weight: 500;
    color: ${theme.text.medium};

    display: flex;
    align-items: center;
    gap: ${theme.space.s};
    padding: ${theme.space.s};
    top: ${theme.space.xs};
    right: ${theme.space.s};

    z-index: 1;

    &:hover {
      color: ${theme.buttons.primary.medium.hover};
    }
  `,
)
