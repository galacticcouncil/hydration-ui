import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

import { TOP_NAVBAR_BREAKPOINT } from "@/modules/layout/constants"

export const SSettingsContent = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.s}px;

    padding: ${theme.buttons.paddings.tertiary}px
      ${theme.containers.paddings.quart}px;

    ${mq(TOP_NAVBAR_BREAKPOINT)} {
      gap: 4px;

      padding: ${theme.containers.paddings.quart}px
        ${theme.containers.paddings.tertiary}px;
    }
  `,
)

export const SSettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
