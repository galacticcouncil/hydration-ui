import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SOtcHeader = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.tertiary};

    padding-bottom: ${theme.space.xl};

    ${mq("sm")} {
      flex-direction: row;
      justify-content: space-between;
      gap: 0;
      padding-bottom: ${theme.space.xxl};
    }
  `,
)
