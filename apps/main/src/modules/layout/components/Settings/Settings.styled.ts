import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

import { TOP_NAVBAR_BREAKPOINT } from "@/modules/layout/constants"

export const SSettingsContent = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};

    padding: ${theme.buttons.paddings.tertiary}
      ${theme.containers.paddings.quart};

    ${mq(TOP_NAVBAR_BREAKPOINT)} {
      gap: ${theme.space.s};

      padding: ${theme.containers.paddings.quart}
        ${theme.containers.paddings.tertiary};
    }
  `,
)

export const SSettingsSection = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.base};
  `,
)
