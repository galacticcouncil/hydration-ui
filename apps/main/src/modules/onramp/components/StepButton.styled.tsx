import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SStepButton = styled(ButtonTransparent)(
  ({ theme }) => css`
    padding-inline: ${theme.scales.paddings.xl}px;
    padding-block: ${theme.scales.paddings.l}px;

    justify-content: flex-start;

    border-radius: ${theme.radii.lg}px;

    transition: ${theme.transitions.colors};
    background: ${theme.buttons.secondary.low.rest};

    &:hover {
      background: ${theme.buttons.secondary.low.hover};
    }
  `,
)
