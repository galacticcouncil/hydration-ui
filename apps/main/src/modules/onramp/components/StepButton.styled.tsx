import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SStepButton = styled(ButtonTransparent)(
  ({ theme }) => css`
    padding-inline: ${theme.space.xl};
    padding-block: ${theme.space.l};

    justify-content: flex-start;

    border-radius: ${theme.radii.l};

    transition: ${theme.transitions.colors};
    background: ${theme.buttons.secondary.low.rest};

    &:hover {
      background: ${theme.buttons.secondary.low.hover};
    }
  `,
)
