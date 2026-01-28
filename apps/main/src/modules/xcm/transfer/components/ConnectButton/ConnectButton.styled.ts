import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SConnectButton = styled(Button)(
  ({ theme }) => css`
    padding: ${theme.space.s};
    padding-right: ${theme.space.base};
    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    height: auto;
  `,
)
