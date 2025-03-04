import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Paper } from "@galacticcouncil/ui/components"

export const SContainer = styled(Paper)(
  ({ theme }) => css`
    padding: 0 ${theme.containers.paddings.primary}px;
  `,
)
