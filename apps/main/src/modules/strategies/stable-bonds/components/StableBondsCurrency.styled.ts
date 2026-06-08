import { Stack } from "@galacticcouncil/ui/components"
import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SCurrencyItem = styled(Stack)`
  width: 100%;
  ${containerSize(
    "md",
    css`
      width: ${pxToRem(120)};
    `,
  )}
  ${containerSize(
    "md",
    css`
      width: ${pxToRem(160)};
    `,
  )}
`
