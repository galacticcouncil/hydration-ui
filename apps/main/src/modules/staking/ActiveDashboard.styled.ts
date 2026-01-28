import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SActiveDashboard = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.primary};

    ${mq("sm")} {
      gap: ${theme.space.xl};
    }

    ${mq("md")} {
      padding-inline: ${theme.containers.paddings.primary};
      padding-top: ${theme.containers.paddings.primary};
    }
  `,
)
