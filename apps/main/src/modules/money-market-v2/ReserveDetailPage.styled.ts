import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Card } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

import { HEADER_HEIGHT } from "@/modules/layout/constants"

// sticks only once TwoColumnGrid puts the sidebar in its own column
export const SStickyCard = styled(Card)(
  ({ theme }) => css`
    ${mq("md")} {
      position: sticky;
      top: calc(${HEADER_HEIGHT} + ${theme.space.xl});
    }
  `,
)
