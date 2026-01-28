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
    gap: ${theme.space.s};
    align-items: center;
    padding: ${theme.space.base};

    top: 0;
    right: ${theme.space.s};

    z-index: 1;

    &:hover {
      color: ${theme.buttons.primary.medium.hover};
    }
  `,
)
