import { css, styled } from "@galacticcouncil/ui/utils"

import { TabMenuBadge } from "@/components/TabMenu/TabMenuBadge"

export const SBadge = styled(TabMenuBadge)(
  ({ theme }) => css`
    transform: translate(-10%, 10%);
    width: ${theme.sizes.m};
    height: ${theme.sizes.m};
    border: 2px solid ${theme.surfaces.themeBasePalette.background};
  `,
)
