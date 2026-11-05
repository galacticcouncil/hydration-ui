import { css, styled } from "@galacticcouncil/ui/utils"

import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"

export const SPortfolioTabMenuItem = styled(TabMenuItem)(
  ({ theme, badge }) => css`
    padding-inline-end: ${badge
      ? `calc(${theme.buttons.paddings.primary} + ${theme.space.s})`
      : theme.buttons.paddings.primary};

    [data-tab-menu-badge] {
      transform: translate(-10%, 10%);
    }
  `,
)
