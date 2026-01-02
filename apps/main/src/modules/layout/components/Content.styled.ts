import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

export const SContent = styled(Box)(
  ({ theme }) => css`
    --layout-gutter: ${theme.scales.paddings.m}px;
    --layout-bottom-safe-area: 10px;

    max-width: 1160px;

    ${mq("lg")} {
      --layout-gutter: 30px;
      --layout-bottom-safe-area: 40px;

      max-width: 1360px;
    }

    margin: 0 auto;

    padding-bottom: var(--layout-bottom-safe-area);
    padding-inline: var(--layout-gutter);
  `,
)
