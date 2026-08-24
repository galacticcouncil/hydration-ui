import { Stack } from "@galacticcouncil/ui/components"
import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SCurrencyItem = styled(Stack)`
  min-width: 0;
  width: 100%;
  ${containerSize(
    "md",
    css`
      width: ${pxToRem(160)};
    `,
  )}
`
