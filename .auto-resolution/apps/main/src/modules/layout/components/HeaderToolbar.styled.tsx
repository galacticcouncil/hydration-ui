import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

import { TOP_NAVBAR_BREAKPOINT } from "@/modules/layout/constants"

export const SHeaderToolbar = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 0px;

    ${mq(TOP_NAVBAR_BREAKPOINT)} {
      gap: ${theme.containers.paddings.quint}px;
      padding: 6px 14px;
    }
  `,
)
