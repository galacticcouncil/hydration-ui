import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SLockedBalanceButton = styled(Button)(
  ({ theme }) => css`
    border: 1px solid;
    border-color: ${theme.buttons.secondary.low.borderRest};
    padding: ${theme.space.base};
    padding-block: ${theme.space.s};
    height: fit-content;
  `,
)
