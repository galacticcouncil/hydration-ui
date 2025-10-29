import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Paper, Separator } from "@galacticcouncil/ui/components"

export const SSwapFormContainer = styled(Paper)(
  ({ theme }) => css`
    --swap-section-padding-inline: ${theme.containers.paddings.primary}px;
    --swap-section-inset-inline: calc(var(--swap-section-padding-inline) * -1);

    padding: 0 var(--swap-section-padding-inline);
  `,
)

export const SwapSectionSeparator = styled(Separator)`
  margin-inline: var(--swap-section-inset-inline);
`
