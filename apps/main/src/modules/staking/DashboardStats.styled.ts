import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SDashboardStats = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.tertiary}px;

    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.l}px;

    ${mq("md")} {
      padding-inline: ${theme.containers.paddings.primary}px;
      padding-block: 40px;

      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 0;
    }
  `,
)
