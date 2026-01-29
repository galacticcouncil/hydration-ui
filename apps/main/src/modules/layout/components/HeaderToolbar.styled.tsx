import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

import { TOP_NAVBAR_BREAKPOINT } from "@/modules/layout/constants"

export const SHeaderToolbar = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};

    ${mq(TOP_NAVBAR_BREAKPOINT)} {
      gap: ${theme.space.base};
    }
  `,
)
