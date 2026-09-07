import { Box } from "@galacticcouncil/ui/components"
import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SCurrencyItem = styled(Box)(
  () => css`
    position: relative;
    min-width: 0;
    width: 100%;
    ${containerSize(
      "md",
      css`
        width: ${pxToRem(160)};
      `,
    )}
  `,
)

export const SCurrencyProgress = styled(Box)(
  ({ theme }) => css`
    position: absolute;
    top: calc(100% - ${theme.space.m});
    left: 0;
    right: 0;
    max-width: ${pxToRem(180)};
  `,
)
