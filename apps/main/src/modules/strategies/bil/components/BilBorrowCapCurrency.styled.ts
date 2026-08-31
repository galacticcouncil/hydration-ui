import { Box } from "@galacticcouncil/ui/components"
import { containerSize, css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SBorrowCapItem = styled(Box)(
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

export const SBorrowCapProgress = styled(Box)(
  ({ theme }) => css`
    position: absolute;
    top: calc(100% - ${theme.space.s});
    left: 0;
    right: 0;
  `,
)
