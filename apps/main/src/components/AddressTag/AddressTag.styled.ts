import { CopyButton } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAddressTagCopyButton = styled(CopyButton)(
  ({ theme }) => css`
    display: inline-flex;
    color: ${theme.text.medium};
    cursor: pointer;

    &[data-copied="true"] {
      color: ${theme.accents.success.emphasis};
    }

    &:hover:not(:disabled) {
      color: ${theme.text.high};
    }
  `,
)
