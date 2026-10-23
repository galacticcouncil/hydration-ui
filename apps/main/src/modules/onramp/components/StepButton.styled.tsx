import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SStepButton = styled(ButtonTransparent)(
  ({ theme }) => css`
    width: 100%;
    gap: ${theme.space.m};
    text-align: left;
    white-space: normal;
    padding-inline: ${theme.space.l};
    padding-block: ${theme.space.m};

    justify-content: flex-start;

    border-radius: ${theme.radii.m};

    transition: ${theme.transitions.colors};
    background: ${theme.buttons.secondary.low.rest};

    ${mq("sm")} {
      gap: ${theme.space.l};
      padding-inline: ${theme.space.xl};
      padding-block: ${theme.space.l};
    }

    &:hover {
      background: ${theme.buttons.secondary.low.hover};
    }
  `,
)
