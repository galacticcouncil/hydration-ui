import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SActiveDashboard = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.primary}px;

    ${mq("sm")} {
      gap: 20px;
    }

    ${mq("md")} {
      padding-inline: ${theme.containers.paddings.primary}px;
      padding-top: ${theme.containers.paddings.primary}px;
    }
  `,
)
