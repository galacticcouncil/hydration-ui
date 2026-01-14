import { ButtonIcon } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SButton = styled(ButtonIcon)(
  ({ theme }) => css`
    background: ${theme.details.separators};

    svg {
      transition: ${theme.transitions.transform};
      transition-duration: 0.1s;
    }

    &:hover:not([disabled]) svg {
      transform: scaleY(-1);
    }
  `,
)
