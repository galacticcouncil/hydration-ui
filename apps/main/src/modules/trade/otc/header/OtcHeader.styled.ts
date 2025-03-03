import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SOtcHeader = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.tertiary}px;

    padding-block: 20px;

    ${mq("sm")} {
      flex-direction: row;
      justify-content: space-between;
      gap: 0;
      padding-block: 32px;
    }
  `,
)
