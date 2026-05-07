import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SChartInvertButton = styled(Button)(
  ({ theme }) => css`
    margin-left: auto;
    padding-inline: ${theme.space.m};
    gap: ${theme.space.s};
  `,
)
